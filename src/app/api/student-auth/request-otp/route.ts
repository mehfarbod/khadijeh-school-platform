import { NextRequest, NextResponse } from "next/server";

import { rateLimitStudentAuth } from "@/lib/auth/student-auth-rate-limit";
import { studentNationalIdSchema } from "@/lib/auth/student-auth-validation";
import {
  requestStudentPasswordResetOtp,
  STUDENT_OTP_REQUEST_MESSAGE,
} from "@/lib/auth/student-otp";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = studentNationalIdSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "کد ملی معتبر نیست." },
        { status: 400 },
      );
    }

    const limit = rateLimitStudentAuth(
      request,
      "student-auth:password-reset-request",
      result.data.nationalId,
      { ipLimit: 10, identifierLimit: 3, windowMs: 15 * 60 * 1000 },
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    return NextResponse.json(
      await requestStudentPasswordResetOtp(result.data.nationalId),
    );
  } catch {
    console.error("Student password reset OTP request failed internally.");
    return NextResponse.json(
      { success: true, message: STUDENT_OTP_REQUEST_MESSAGE },
      { status: 200 },
    );
  }
}
