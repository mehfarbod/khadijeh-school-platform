import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailOtp } from "@/lib/auth/verify-otp";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("فرمت ایمیل صحیح نیست.")
    .max(255, "ایمیل بیش از حد طولانی است.")
    .transform((value) => value.toLowerCase()),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "کد تأیید باید ۶ رقم باشد."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "ایمیل یا کد تأیید معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, code } = result.data;

    const verificationResult = await verifyEmailOtp(email, code);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: verificationResult.status }
      );
    }

    return NextResponse.json({
      success: true,
      user: verificationResult.user,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return NextResponse.json(
      { error: "خطایی در تأیید کد رخ داد." },
      { status: 500 }
    );
  }
}