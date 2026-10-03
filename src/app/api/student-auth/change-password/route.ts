import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/security/rate-limit";
import {
  newStudentPasswordSchema,
  validatePermanentStudentPassword,
} from "@/lib/auth/student-auth-validation";
import { hashStudentPassword } from "@/lib/auth/student-password";
import {
  createStudentSession,
  requireStudentPasswordChange,
} from "@/lib/auth/student-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "student-auth:forced-password-change", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const student = await requireStudentPasswordChange();
    const body: unknown = await request.json();
    const result = newStudentPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "رمز عبور معتبر نیست." },
        { status: 400 },
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
    const currentVersion = student.studentAccount!.sessionVersion;
    const update = await prisma.studentAccount.updateMany({
      where: {
        studentId: student.id,
        isActive: true,
        mustChangePassword: true,
        sessionVersion: currentVersion,
      },
      data: {
        passwordHash,
        mustChangePassword: false,
        sessionVersion: { increment: 1 },
      },
    });

    if (update.count !== 1) {
      return NextResponse.json(
        { error: "نشست شما تغییر کرده است. لطفاً دوباره وارد شوید." },
        { status: 409 },
      );
    }

    await createStudentSession(student.id, currentVersion + 1);
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

    console.error("Student forced password change error:", error);
    return NextResponse.json(
      { error: "خطایی در تغییر رمز عبور رخ داد." },
      { status: 500 },
    );
  }
}
