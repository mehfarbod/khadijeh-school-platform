import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyStudentOtp } from "@/lib/auth/student-otp";
import { rateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  identifier: z.string().trim().min(1).max(255),
  code: z.string().trim().regex(/^\d{6}$/, "کد تأیید باید ۶ رقم باشد."),
});

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "student-auth:otp-verify", {
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "ایمیل یا کد تأیید معتبر نیست." },
        { status: 400 },
      );
    }

    const verification = await verifyStudentOtp(
      result.data.identifier,
      result.data.code,
    );

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student OTP verification error:", error);
    return NextResponse.json(
      { error: "خطایی در تأیید کد رخ داد." },
      { status: 500 },
    );
  }
}
