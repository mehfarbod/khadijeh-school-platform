import { NextRequest, NextResponse } from "next/server";

import {
  newAdminPasswordSchema,
  validatePermanentAdminPassword,
} from "@/lib/auth/admin-auth-validation";
import {
  clearAdminPasswordResetSession,
  getAdminPasswordResetSession,
} from "@/lib/auth/admin-password-reset-session";
import { clearAdminSession } from "@/lib/auth/admin-session";
import { hashStudentPassword } from "@/lib/auth/student-password";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security/rate-limit";

const INVALID_RESET_SESSION_MESSAGE =
  "مجوز بازیابی رمز عبور نامعتبر یا منقضی شده است.";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "admin-auth:password-reset", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error:
            "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const resetSession = await getAdminPasswordResetSession();
    if (!resetSession) {
      return NextResponse.json(
        { error: INVALID_RESET_SESSION_MESSAGE },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const result = newAdminPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "رمز عبور معتبر نیست." },
        { status: 400 },
      );
    }

    const admin = await prisma.user.findFirst({
      where: {
        id: resetSession.userId,
        isActive: true,
        sessionVersion: resetSession.sessionVersion,
        staff: {
          is: {
            isActive: true,
            nationalId: { not: null },
          },
        },
      },
      select: { id: true, staff: { select: { nationalId: true } }, },
    });

    if (!admin?.staff?.nationalId) {
      return NextResponse.json(
        { error: INVALID_RESET_SESSION_MESSAGE },
        { status: 401 },
      );
    }

    const nationalId = admin.staff.nationalId;

    const passwordError = validatePermanentAdminPassword(
      result.data.password,
      nationalId,
    );
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const passwordHash = await hashStudentPassword(result.data.password);
    const now = new Date();
    const reset = await prisma.$transaction(async (tx) => {
      const accountUpdate = await tx.user.updateMany({
        where: {
          id: admin.id,
          isActive: true,
          sessionVersion: resetSession.sessionVersion,
          staff: {
            is: {
              isActive: true,
              nationalId,
            },
          },
        },
        data: {
          passwordHash,
          mustChangePassword: false,
          sessionVersion: { increment: 1 },
          lastLoginAt: now,
        },
      });
      if (accountUpdate.count !== 1) return false;

      await tx.adminPasswordResetOtp.updateMany({
        where: { userId: admin.id, consumedAt: null },
        data: { consumedAt: now },
      });
      return true;
    });

    if (!reset) {
      return NextResponse.json(
        { error: INVALID_RESET_SESSION_MESSAGE },
        { status: 401 },
      );
    }

    await Promise.all([clearAdminPasswordResetSession(), clearAdminSession()]);
    return NextResponse.json({ success: true });
  } catch {
    console.error("Admin password reset failed internally.");
    return NextResponse.json(
      { error: "خطایی در ثبت رمز عبور جدید رخ داد." },
      { status: 500 },
    );
  }
}
