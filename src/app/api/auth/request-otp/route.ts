import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiration, hashOtp } from "@/lib/auth/otp";

const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("فرمت ایمیل صحیح نیست.")
    .max(255, "ایمیل بیش از حد طولانی است.")
    .transform((value) => value.toLowerCase()),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = requestOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "ایمیل واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const email = result.data.email;

    const now = new Date();

    const windowStart = new Date(now.getTime() - OTP_WINDOW_MS);

    const recentRequests = await prisma.emailOtp.findMany({
      where: {
        email,
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: MAX_REQUESTS_PER_WINDOW,
    });

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          error:
            "تعداد درخواست‌های کد تأیید بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.",
        },
        { status: 429 },
      );
    }

    const latestRequest = recentRequests[0];

    if (
      latestRequest &&
      now.getTime() - latestRequest.createdAt.getTime() < OTP_COOLDOWN_MS
    ) {
      return NextResponse.json(
        {
          error: "لطفاً قبل از درخواست کد جدید کمی صبر کنید.",
        },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
      },
    });

    /*
     * عمداً اطلاعات وجود یا عدم وجود حساب را فاش نمی‌کنیم.
     * این کار از User Enumeration جلوگیری می‌کند.
     */
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: true,
        message:
          "اگر حساب فعالی با این ایمیل وجود داشته باشد، کد تأیید ارسال خواهد شد.",
      });
    }

    const code = generateOtp();

    await prisma.emailOtp.updateMany({
      where: {
        email,
        consumedAt: null,
      },
      data: {
        consumedAt: now,
      },
    });

    await prisma.emailOtp.create({
      data: {
        email,
        codeHash: hashOtp(code),
        expiresAt: getOtpExpiration(),
      },
    });

    // فقط برای توسعه؛ قبل از production باید حذف شود
    // و ارسال واقعی ایمیل جایگزین شود.
    console.log(`[DEV OTP] ${email}: ${code}`);

    return NextResponse.json({
      success: true,
      message:
        "اگر حساب فعالی با این ایمیل وجود داشته باشد، کد تأیید ارسال خواهد شد.",
    });
  } catch (error) {
    console.error("Request OTP error:", error);

    return NextResponse.json(
      { error: "خطایی در ارسال کد تأیید رخ داد." },
      { status: 500 },
    );
  }
}
