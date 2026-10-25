import { NextRequest, NextResponse } from "next/server";

import { rateLimitAdminAuth } from "@/lib/auth/admin-auth-rate-limit";
import { adminPasswordResetRequestSchema } from "@/lib/auth/admin-auth-validation";
import {
  ADMIN_PASSWORD_RESET_REQUEST_MESSAGE,
  requestAdminPasswordResetOtp,
} from "@/lib/auth/admin-password-reset-otp";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = adminPasswordResetRequestSchema.safeParse(body);

    // The response intentionally does not reveal whether this identifier is
    // associated with an eligible staff account.
    if (!result.success) {
      return NextResponse.json({
        success: true,
        message: ADMIN_PASSWORD_RESET_REQUEST_MESSAGE,
      });
    }

    const limit = rateLimitAdminAuth(
      request,
      "admin-auth:password-reset-request",
      result.data.nationalId,
      { ipLimit: 10, identifierLimit: 3, windowMs: 15 * 60 * 1000 },
    );

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error:
            "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    return NextResponse.json(
      await requestAdminPasswordResetOtp(result.data.nationalId),
    );
  } catch {
    console.error("Admin password reset OTP request failed internally.");
    return NextResponse.json({
      success: true,
      message: ADMIN_PASSWORD_RESET_REQUEST_MESSAGE,
    });
  }
}
