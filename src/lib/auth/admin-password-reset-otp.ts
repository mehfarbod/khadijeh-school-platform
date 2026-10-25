import { iranianMobileSchema } from "@/lib/validation/student";
import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiration, hashOtp, verifyOtp } from "@/lib/auth/otp";
import { sendAdminPasswordResetOtp } from "@/lib/notifications/sms";

export const ADMIN_PASSWORD_RESET_REQUEST_MESSAGE =
  "اگر اطلاعات صحیح باشد، کد بازیابی ارسال خواهد شد.";
export const ADMIN_PASSWORD_RESET_INVALID_OTP_MESSAGE =
  "کد تأیید نامعتبر یا منقضی شده است.";

const MAX_OTP_ATTEMPTS = 5;

const genericRequestResult = () => ({
  success: true as const,
  message: ADMIN_PASSWORD_RESET_REQUEST_MESSAGE,
});

export async function requestAdminPasswordResetOtp(nationalId: string) {
  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
      staff: {
        is: {
          isActive: true,
          nationalId,
          phone: { not: null },
        },
      },
    },
    select: {
      id: true,
      staff: { select: { phone: true } },
    },
  });

  const phoneResult = iranianMobileSchema.safeParse(user?.staff?.phone ?? "");
  if (!user || !phoneResult.success) return genericRequestResult();

  const code = generateOtp();
  const now = new Date();
  const otp = await prisma.$transaction(async (tx) => {
    await tx.adminPasswordResetOtp.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: now },
    });

    return tx.adminPasswordResetOtp.create({
      data: {
        userId: user.id,
        phone: phoneResult.data,
        codeHash: hashOtp(code),
        expiresAt: getOtpExpiration(),
        // OTP becomes usable only after provider delivery succeeds.
        consumedAt: now,
      },
      select: { id: true },
    });
  });

  try {
    await sendAdminPasswordResetOtp({ to: phoneResult.data, code });
  } catch {
    console.error("Admin password reset OTP delivery failed.");
    return genericRequestResult();
  }

  try {
    const activation = await prisma.adminPasswordResetOtp.updateMany({
      where: { id: otp.id, consumedAt: { not: null } },
      data: { consumedAt: null },
    });
    if (activation.count !== 1) {
      console.error("Admin password reset OTP activation failed.");
    }
  } catch {
    console.error("Admin password reset OTP activation failed.");
  }

  return genericRequestResult();
}

type VerifyAdminOtpResult =
  | { success: true; userId: string; sessionVersion: number }
  | { success: false };

export async function verifyAdminPasswordResetOtp(
  nationalId: string,
  code: string,
): Promise<VerifyAdminOtpResult> {
  const now = new Date();
  const otp = await prisma.adminPasswordResetOtp.findFirst({
    where: {
      consumedAt: null,
      user: {
        isActive: true,
        staff: {
          is: {
            isActive: true,
            nationalId,
            phone: { not: null },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      codeHash: true,
      expiresAt: true,
      attempts: true,
      user: { select: { id: true, sessionVersion: true } },
    },
  });

  if (!otp || otp.expiresAt <= now || otp.attempts >= MAX_OTP_ATTEMPTS) {
    return { success: false };
  }

  if (!verifyOtp(code, otp.codeHash)) {
    await prisma.adminPasswordResetOtp.updateMany({
      where: {
        id: otp.id,
        consumedAt: null,
        attempts: { lt: MAX_OTP_ATTEMPTS },
        expiresAt: { gt: now },
      },
      data: { attempts: { increment: 1 } },
    });
    return { success: false };
  }

  const consumeResult = await prisma.adminPasswordResetOtp.updateMany({
    where: {
      id: otp.id,
      consumedAt: null,
      attempts: { lt: MAX_OTP_ATTEMPTS },
      expiresAt: { gt: now },
    },
    data: { consumedAt: now },
  });
  if (consumeResult.count !== 1) return { success: false };

  return {
    success: true,
    userId: otp.user.id,
    sessionVersion: otp.user.sessionVersion,
  };
}
