import { NextRequest, NextResponse } from "next/server";

import { rateLimitAdminAuth } from "@/lib/auth/admin-auth-rate-limit";
import { adminPasswordResetOtpVerificationSchema } from "@/lib/auth/admin-auth-validation";
import {
  ADMIN_PASSWORD_RESET_INVALID_OTP_MESSAGE,
  verifyAdminPasswordResetOtp,
} from "@/lib/auth/admin-password-reset-otp";
import {
  assertAdminPasswordResetSessionConfigured,
  createAdminPasswordResetSession,
} from "@/lib/auth/admin-password-reset-session";

export async function POST(request: NextRequest) {
  try {
    assertAdminPasswordResetSessionConfigured();
    const body: unknown = await request.json();
    const result = adminPasswordResetOtpVerificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: ADMIN_PASSWORD_RESET_INVALID_OTP_MESSAGE },
        { status: 400 },
      );
    }

    const limit = rateLimitAdminAuth(
      request,
      "admin-auth:password-reset-verify",
      result.data.nationalId,
      { ipLimit: 20, identifierLimit: 10, windowMs: 15 * 60 * 1000 },
    );
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

    const verification = await verifyAdminPasswordResetOtp(
      result.data.nationalId,
      result.data.code,
    );
    if (!verification.success) {
      return NextResponse.json(
        { error: ADMIN_PASSWORD_RESET_INVALID_OTP_MESSAGE },
        { status: 400 },
      );
    }

    await createAdminPasswordResetSession(
      verification.userId,
      verification.sessionVersion,
    );
    return NextResponse.json({ success: true });
  } catch {
    console.error("Admin password reset OTP verification failed internally.");
    return NextResponse.json(
      { error: "خطایی در تأیید کد رخ داد." },
      { status: 500 },
    );
  }
}
