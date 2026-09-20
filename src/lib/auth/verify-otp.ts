import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/auth/otp";

type VerifyOtpResult =
  | {
      success: true;
      user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
      };
    }
  | {
      success: false;
      error: string;
      status: number;
    };

export async function verifyEmailOtp(
  email: string,
  code: string
): Promise<VerifyOtpResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const otp = await prisma.emailOtp.findFirst({
    where: {
      email: normalizedEmail,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otp) {
    return {
      success: false,
      error: "کد تأیید نامعتبر یا منقضی شده است.",
      status: 400,
    };
  }

  if (otp.expiresAt < new Date()) {
    return {
      success: false,
      error: "کد تأیید منقضی شده است.",
      status: 400,
    };
  }

  if (otp.attempts >= 5) {
    return {
      success: false,
      error: "تعداد تلاش‌های مجاز به پایان رسیده است.",
      status: 429,
    };
  }

  const isValid = verifyOtp(code, otp.codeHash);

  if (!isValid) {
    const updateResult = await prisma.emailOtp.updateMany({
      where: {
        id: otp.id,
        consumedAt: null,
        attempts: {
          lt: 5,
        },
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    if (updateResult.count === 0) {
      return {
        success: false,
        error: "تعداد تلاش‌های مجاز به پایان رسیده است.",
        status: 429,
      };
    }

    return {
      success: false,
      error: "کد تأیید نادرست است.",
      status: 400,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user || !user.isActive) {
    return {
      success: false,
      error: "کد تأیید نامعتبر است.",
      status: 400,
    };
  }

  /*
   * مصرف OTP به‌صورت شرطی انجام می‌شود تا یک OTP
   * نتواند توسط دو درخواست هم‌زمان دوباره استفاده شود.
   */
  const consumeResult = await prisma.emailOtp.updateMany({
    where: {
      id: otp.id,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  if (consumeResult.count === 0) {
    return {
      success: false,
      error: "کد تأیید قبلاً استفاده شده است.",
      status: 400,
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}