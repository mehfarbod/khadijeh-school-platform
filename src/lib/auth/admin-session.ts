import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "khadijeh_admin_password_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SECRET = process.env.NEXTAUTH_SECRET;

type AdminSessionPayload = {
  userId: string;
  sessionVersion: number;
  exp: number;
};

export type AuthenticatedAdmin = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  mustChangePassword: boolean;
  sessionVersion: number;
  staff: {
    id: string;
    nationalId: string;
  };
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getAdminSessionSecret())
    .update(value)
    .digest("base64url");
}

export function assertAdminSessionConfigured() {
  getAdminSessionSecret();
}

function getAdminSessionSecret() {
  if (!SECRET) throw new Error("NEXTAUTH_SECRET is not configured.");
  return SECRET;
}

function createToken(userId: string, sessionVersion: number) {
  const payload: AdminSessionPayload = {
    userId,
    sessionVersion,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encodedPayload = encode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token: string): AdminSessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  let expected: string;
  try {
    expected = sign(encodedPayload);
  } catch {
    return null;
  }

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as AdminSessionPayload;
    if (
      !payload.userId ||
      typeof payload.sessionVersion !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function getAdminSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  return token ? verifyToken(token) : null;
}

export async function createAdminSession(userId: string, sessionVersion: number) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(userId, sessionVersion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const payload = await getAdminSessionPayload();
  if (!payload) return null;

  return prisma.user.findFirst({
    where: {
      id: payload.userId,
      isActive: true,
      sessionVersion: payload.sessionVersion,
      staff: {
        is: {
          isActive: true,
          nationalId: { not: null },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
      sessionVersion: true,
      staff: {
        select: {
          id: true,
          nationalId: true,
        },
      },
    },
  }).then((user) => {
    if (!user?.staff?.nationalId) return null;

    return {
      ...user,
      staff: {
        id: user.staff.id,
        nationalId: user.staff.nationalId,
      },
    };
  });
}

export async function getCurrentAdmin() {
  const admin = await getAuthenticatedAdmin();

  return admin?.mustChangePassword ? null : admin;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");

  return admin;
}

export async function requireAdminPasswordChange() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (!admin.mustChangePassword) {
    throw new Error("PASSWORD_CHANGE_NOT_REQUIRED");
  }

  return admin;
}
