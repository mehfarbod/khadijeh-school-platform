import { NextRequest, NextResponse } from "next/server";

import {
  newStudentPasswordSchema,
  validatePermanentStudentPassword,
} from "@/lib/auth/student-auth-validation";
import { hashStudentPassword } from "@/lib/auth/student-password";
import {
  clearStudentPasswordResetSession,
  getStudentPasswordResetSession,
} from "@/lib/auth/student-password-reset-session";
import { clearStudentSession } from "@/lib/auth/student-session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "student-auth:password-reset", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const resetSession = await getStudentPasswordResetSession();
    if (!resetSession) {
      return NextResponse.json(
        { error: "مجوز بازیابی رمز عبور نامعتبر یا منقضی شده است." },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();
    const result = newStudentPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "رمز عبور معتبر نیست." },
        { status: 400 },
      );
    }

    const student = await prisma.student.findFirst({
      where: {
        id: resetSession.studentId,
        isActive: true,
        studentAccount: {
          is: {
            isActive: true,
            sessionVersion: resetSession.sessionVersion,
          },
        },
      },
      select: { id: true, nationalId: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "مجوز بازیابی رمز عبور نامعتبر یا منقضی شده است." },
        { status: 401 },
      );
    }

    const passwordError = validatePermanentStudentPassword(
      result.data.password,
      student.nationalId,
    );
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const passwordHash = await hashStudentPassword(result.data.password);
    const [accountUpdate] = await prisma.$transaction([
      prisma.studentAccount.updateMany({
        where: {
          studentId: student.id,
          isActive: true,
          sessionVersion: resetSession.sessionVersion,
        },
        data: {
          passwordHash,
          mustChangePassword: false,
          sessionVersion: { increment: 1 },
        },
      }),
      prisma.studentOtp.updateMany({
        where: { studentId: student.id, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
    ]);

    if (accountUpdate.count !== 1) {
      return NextResponse.json(
        { error: "مجوز بازیابی رمز عبور نامعتبر یا منقضی شده است." },
        { status: 401 },
      );
    }

    await Promise.all([
      clearStudentPasswordResetSession(),
      clearStudentSession(),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student password reset error:", error);
    return NextResponse.json(
      { error: "خطایی در ثبت رمز عبور جدید رخ داد." },
      { status: 500 },
    );
  }
}
