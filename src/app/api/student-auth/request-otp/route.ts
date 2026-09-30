import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestStudentOtp } from "@/lib/auth/student-otp";
import { rateLimit } from "@/lib/security/rate-limit";

const schema = z.object({
  identifier: z.string().trim().min(1).max(255),
});

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "student-auth:otp-request", {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "ایمیل یا کد ملی را وارد کنید." },
        { status: 400 },
      );
    }

    return NextResponse.json(await requestStudentOtp(result.data.identifier));
  } catch (error) {
    console.error("Student OTP request error:", error);
    return NextResponse.json(
      { error: "خطایی در ارسال کد تأیید رخ داد." },
      { status: 500 },
    );
  }
}
