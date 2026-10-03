import { NextRequest, NextResponse } from "next/server";

import { rateLimitStudentAuth } from "@/lib/auth/student-auth-rate-limit";
import { studentOtpVerificationSchema } from "@/lib/auth/student-auth-validation";
import {
  STUDENT_OTP_INVALID_MESSAGE,
  verifyStudentPasswordResetOtp,
} from "@/lib/auth/student-otp";
import { createStudentPasswordResetSession } from "@/lib/auth/student-password-reset-session";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = studentOtpVerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست." },
        { status: 400 },
      );
    }

    const limit = rateLimitStudentAuth(
      request,
      "student-auth:password-reset-verify",
      result.data.nationalId,
      { ipLimit: 20, identifierLimit: 10, windowMs: 15 * 60 * 1000 },
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const verification = await verifyStudentPasswordResetOtp(
      result.data.nationalId,
      result.data.code,
    );

    if (!verification.success) {
      return NextResponse.json(
        { error: STUDENT_OTP_INVALID_MESSAGE },
        { status: 400 },
      );
    }

    await createStudentPasswordResetSession(
      verification.studentId,
      verification.sessionVersion,
    );

    return NextResponse.json({ success: true });
  } catch {
    console.error("Student password reset OTP verification failed internally.");
    return NextResponse.json(
      { error: "خطایی در تأیید کد رخ داد." },
      { status: 500 },
    );
  }
}
