import { NextRequest, NextResponse } from "next/server";

import {
  newAdminPasswordSchema,
  validatePermanentAdminPassword,
} from "@/lib/auth/admin-auth-validation";
import {
  assertAdminSessionConfigured,
  createAdminSession,
  requireAdminPasswordChange,
} from "@/lib/auth/admin-session";
import { hashStudentPassword } from "@/lib/auth/student-password";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    assertAdminSessionConfigured();
    const limit = rateLimit(request, "admin-auth:forced-password-change", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const admin = await requireAdminPasswordChange();
    const body: unknown = await request.json();
    const result = newAdminPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "رمز عبور معتبر نیست." },
        { status: 400 },
      );
    }

    const passwordError = validatePermanentAdminPassword(
      result.data.password,
      admin.staff.nationalId,
    );
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const passwordHash = await hashStudentPassword(result.data.password);
    const update = await prisma.user.updateMany({
      where: {
        id: admin.id,
        isActive: true,
        mustChangePassword: true,
        sessionVersion: admin.sessionVersion,
        staff: {
          is: {
            isActive: true,
            nationalId: admin.staff.nationalId,
          },
        },
      },
      data: {
        passwordHash,
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
        lastLoginAt: new Date(),
      },
    });

    if (update.count !== 1) {
      return NextResponse.json(
        { error: "نشست شما تغییر کرده است. لطفاً دوباره وارد شوید." },
        { status: 409 },
      );
    }

    await createAdminSession(admin.id, admin.sessionVersion + 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "برای تغییر رمز عبور ابتدا وارد شوید." },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "PASSWORD_CHANGE_NOT_REQUIRED"
    ) {
      return NextResponse.json(
        { error: "تغییر اجباری رمز عبور برای این حساب لازم نیست." },
        { status: 409 },
      );
    }

    console.error("Admin forced password change failed internally.");
    return NextResponse.json(
      { error: "خطایی در تغییر رمز عبور رخ داد." },
      { status: 500 },
    );
  }
}
