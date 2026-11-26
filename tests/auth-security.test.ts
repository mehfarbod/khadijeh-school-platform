import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import test from "node:test";

import {
  assignableRolesFor,
  canAssignRole,
  canManageAccount,
} from "../src/lib/auth/admin-account-policy";
import {
  hashStudentPassword,
  verifyStudentPassword,
} from "../src/lib/auth/student-password";
import { getOtpExpiration, hashOtp, verifyOtp } from "../src/lib/auth/otp";
import { sendAdminPasswordResetOtp } from "../src/lib/notifications/sms";
import {
  adminPasswordSchema,
  validatePermanentAdminPassword,
} from "../src/lib/auth/admin-auth-validation";
import {
  invalidateOutstandingAdminRecoveryOtps,
  isCurrentAdminRecoveryPhone,
} from "../src/lib/auth/admin-recovery-state";
import { seedPermissionCatalog } from "../src/lib/auth/permission-seeding";
import type { Prisma } from "../src/generated/prisma/client";

const read = (path: string) => readFileSync(path, "utf8");

test("admin passwords use scrypt and reject a different password", async () => {
  const password = randomBytes(32).toString("base64url");
  const differentPassword = randomBytes(32).toString("base64url");
  const hash = await hashStudentPassword(password);

  assert.match(hash, /^scrypt\$32768\$8\$1\$/);
  assert.equal(await verifyStudentPassword(password, hash), true);
  assert.equal(await verifyStudentPassword(differentPassword, hash), false);
});

test("OTP hashes are keyed, expire after five minutes, and verify safely", () => {
  const previousSecret = process.env.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_SECRET = randomBytes(32).toString("hex");
  try {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hash = hashOtp(code);
    const remaining = getOtpExpiration().getTime() - Date.now();

    assert.match(hash, /^hmac-sha256\$/);
    assert.equal(hash.includes(code), false);
    assert.equal(verifyOtp(code, hash), true);
    assert.ok(remaining > 4 * 60 * 1000 && remaining <= 5 * 60 * 1000);
  } finally {
    if (previousSecret === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = previousSecret;
  }
});

test("SMS recovery is disabled unless local OTP exposure is explicitly enabled", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousExposeOtp = process.env.DEV_EXPOSE_AUTH_OTP;
  Object.assign(process.env, { NODE_ENV: "production" });
  try {
    await assert.rejects(
      sendAdminPasswordResetOtp({ to: "", code: "" }),
      /SMS_PROVIDER_NOT_CONFIGURED/,
    );

    Object.assign(process.env, { NODE_ENV: "development" });
    Reflect.deleteProperty(process.env, "DEV_EXPOSE_AUTH_OTP");
    await assert.rejects(
      sendAdminPasswordResetOtp({ to: "09123456789", code: "123456" }),
      /SMS_PROVIDER_NOT_CONFIGURED/,
    );

    process.env.DEV_EXPOSE_AUTH_OTP = "true";
    const messages: string[] = [];
    const originalInfo = console.info;
    console.info = (message?: unknown) => messages.push(String(message));
    try {
      await sendAdminPasswordResetOtp({
        to: "09123456789",
        code: "123456",
      });
    } finally {
      console.info = originalInfo;
    }
    assert.equal(messages.length, 1);
    assert.equal(messages[0].includes("09123456789"), false);
    assert.equal(messages[0].includes("09*******89"), true);
  } finally {
    if (previousNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previousNodeEnv });
    if (previousExposeOtp === undefined) {
      Reflect.deleteProperty(process.env, "DEV_EXPOSE_AUTH_OTP");
    } else {
      process.env.DEV_EXPOSE_AUTH_OTP = previousExposeOtp;
    }
  }
});

test("legacy email, NextAuth, and Convex entry points are removed", () => {
  for (const path of [
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/api/auth/request-otp/route.ts",
    "src/app/api/auth/verify-otp/route.ts",
    "src/lib/auth/auth-options.ts",
    "src/lib/auth/verify-otp.ts",
    "src/convex/schema.ts",
    "src/convex/http.ts",
    "src/convex/auth.ts",
    "src/convex/auth/emailOtp.ts",
    "convex.json",
  ]) {
    assert.equal(existsSync(path), false, path);
  }

  assert.doesNotMatch(read("src/lib/auth/authorization.ts"), /next-auth|EmailOtp/);
  assert.doesNotMatch(read("package.json"), /@convex-dev\/auth|"convex"/);
});

test("password changes and resets invalidate all sessions while logout stays local", () => {
  for (const path of [
    "src/app/api/admin-auth/change-password/route.ts",
    "src/app/api/admin-auth/reset-password/route.ts",
  ]) {
    assert.match(read(path), /sessionVersion:\s*\{[\s\S]*?increment:\s*1\s*\}/, path);
  }
  const logout = read("src/app/api/admin-auth/logout/route.ts");
  assert.match(logout, /clearAdminSession/);
  assert.doesNotMatch(logout, /sessionVersion|prisma/);
});

test("OTP verification retains attempt and one-time-use controls", () => {
  const source = read("src/lib/auth/admin-password-reset-otp.ts");
  assert.match(source, /MAX_OTP_ATTEMPTS\s*=\s*5/);
  assert.match(source, /OTP_RESEND_COOLDOWN_MS\s*=\s*60\s*\*\s*1000/);
  assert.match(source, /attempts:\s*\{[\s\S]*?increment:\s*1\s*\}/);
  assert.match(source, /data:\s*\{[\s\S]*?consumedAt:\s*now\s*\}/);
  assert.match(source, /isCurrentAdminRecoveryPhone/);
  assert.match(source, /sessionVersion:\s*user\.sessionVersion/);
  assert.match(source, /nationalId:\s*user\.staff\.nationalId/);
  assert.match(source, /sessionVersion:\s*otp\.user\.sessionVersion/);
  assert.match(source, /nationalId:\s*currentStaff\.nationalId/);
  assert.match(source, /phone:\s*currentStaff\.phone/);
});

test("identity changes invalidate open recovery OTPs and phone matching is normalized", async () => {
  let updateArguments: unknown;
  const tx = {
    adminPasswordResetOtp: {
      updateMany: async (args: unknown) => {
        updateArguments = args;
        return { count: 1 };
      },
    },
  } as unknown as Prisma.TransactionClient;

  const now = new Date("2026-01-01T00:00:00.000Z");
  await invalidateOutstandingAdminRecoveryOtps(tx, "user-id", now);
  assert.deepEqual(updateArguments, {
    where: { userId: "user-id", consumedAt: null },
    data: { consumedAt: now },
  });
  assert.equal(isCurrentAdminRecoveryPhone("09123456789", "۰۹۱۲۳۴۵۶۷۸۹"), true);
  assert.equal(isCurrentAdminRecoveryPhone("09123456789", "09999999999"), false);

  for (const path of [
    "src/app/api/staff/[id]/route.ts",
    "src/app/api/admin/users/[id]/route.ts",
  ]) {
    assert.match(read(path), /invalidateOutstandingAdminRecoveryOtps/, path);
  }
});

test("new admin passwords require eight non-whitespace characters", () => {
  assert.equal(adminPasswordSchema.safeParse("        ").success, false);
  assert.equal(adminPasswordSchema.safeParse("abc 12345").success, true);
  assert.equal(adminPasswordSchema.safeParse("short 1").success, false);
  assert.notEqual(
    validatePermanentAdminPassword("۱۲۳۴۵۶۷۸۹۰", "1234567890"),
    null,
  );
});

test("role policy protects SUPER_ADMIN and prevents SCHOOL_ADMIN escalation", () => {
  assert.deepEqual(assignableRolesFor("SCHOOL_ADMIN"), [
    "CONTENT_MANAGER",
    "TEACHER",
    "STAFF",
  ]);
  assert.equal(canAssignRole("SCHOOL_ADMIN", "SCHOOL_ADMIN"), false);
  assert.equal(canAssignRole("SCHOOL_ADMIN", "SUPER_ADMIN"), false);
  assert.equal(canAssignRole("SUPER_ADMIN", "SCHOOL_ADMIN"), true);
  assert.equal(canManageAccount("SCHOOL_ADMIN", "SUPER_ADMIN"), false);
  assert.equal(canManageAccount("SUPER_ADMIN", "SUPER_ADMIN"), false);
});

test("bootstrap is locked, idempotent, and does not update an existing super admin", () => {
  const source = read("src/lib/auth/bootstrap-super-admin.ts");
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /existingSuperAdmin/);
  assert.match(source, /created:\s*false/);
  assert.doesNotMatch(source, /user\.update|staff\.update/);
  assert.match(source, /seedPermissionCatalog/);
});

test("permission seeding is additive and never deletes custom role permissions", async () => {
  const permissions = new Map<string, string>();
  let roleUpserts = 0;
  let roleDeletes = 0;
  const tx = {
    permission: {
      upsert: async (args: {
        where: { key: string };
        create: { key: string; name: string; group: string };
      }) => {
        const id = permissions.get(args.where.key) ?? `permission-${permissions.size}`;
        permissions.set(args.where.key, id);
        return { id, key: args.create.key };
      },
    },
    rolePermission: {
      upsert: async () => {
        roleUpserts += 1;
        return {};
      },
      deleteMany: async () => {
        roleDeletes += 1;
        return { count: 0 };
      },
    },
  } as unknown as Prisma.TransactionClient;

  const first = await seedPermissionCatalog(tx);
  const second = await seedPermissionCatalog(tx);
  assert.deepEqual(second, first);
  assert.ok(roleUpserts > 0);
  assert.equal(roleDeletes, 0);
  assert.doesNotMatch(read("src/lib/auth/permission-seeding.ts"), /deleteMany/);
});

test("National IDs remain unique and duplicate writes return conflict", () => {
  assert.match(read("prisma/schema.prisma"), /nationalId\s+String\?\s+@unique/);
  assert.match(read("src/app/api/staff/route.ts"), /error\.code === "P2002"/);
  assert.match(read("src/app/api/admin/users/route.ts"), /error\.code === "P2002"/);
});
