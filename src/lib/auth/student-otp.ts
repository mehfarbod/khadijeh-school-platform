import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiration, hashOtp, verifyOtp } from "@/lib/auth/otp";
import { sendSmsOtp } from "@/lib/notifications/sms";

export const STUDENT_OTP_REQUEST_MESSAGE =
  "اگر کد ملی واردشده مربوط به یک حساب واجد شرایط باشد، کد تأیید ارسال خواهد شد.";
export const STUDENT_OTP_INVALID_MESSAGE =
  "کد تأیید نامعتبر یا منقضی شده است.";

const genericRequestResult = () => ({
  success: true as const,
  message: STUDENT_OTP_REQUEST_MESSAGE,
});

export async function requestStudentPasswordResetOtp(nationalId: string) {
  const student = await prisma.student.findUnique({
    where: { nationalId },
    select: {
      id: true,
      isActive: true,
      mobile: true,
      fatherMobile: true,
      studentAccount: {
        select: { isActive: true },
      },
    },
  });

  if (!student?.isActive || student.studentAccount?.isActive === false) {
    return genericRequestResult();
  }

  const phone = student.mobile?.trim() || student.fatherMobile?.trim() || "";

  if (!phone) {
    return genericRequestResult();
  }

  await prisma.studentAccount.upsert({
    where: { studentId: student.id },
    create: { studentId: student.id, isActive: true },
    update: {},
  });

  const code = generateOtp();
  const now = new Date();

  const otp = await prisma.$transaction(async (tx) => {
    await tx.studentOtp.updateMany({
      where: { studentId: student.id, consumedAt: null },
      data: { consumedAt: now },
    });

    return tx.studentOtp.create({
      data: {
        studentId: student.id,
        phone,
        codeHash: hashOtp(code),
        expiresAt: getOtpExpiration(),
        // The challenge becomes usable only after delivery succeeds. This
        // keeps provider errors and process failures fail-closed.
        consumedAt: now,
      },
      select: { id: true },
    });
  });

  // Provider-agnostic boundary: development logs the OTP, while production
  // deliberately fails closed until a real provider is configured here.
  try {
    await sendSmsOtp({ to: phone, code });
  } catch {
    console.error("Student password reset OTP delivery failed.");
    return genericRequestResult();
  }

  try {
    const activation = await prisma.studentOtp.updateMany({
      where: { id: otp.id, consumedAt: { not: null } },
      data: { consumedAt: null },
    });

    if (activation.count !== 1) {
      console.error("Student password reset OTP activation failed.");
    }
  } catch {
    console.error("Student password reset OTP activation failed.");
  }

  return genericRequestResult();
}

type VerifyStudentOtpResult =
  | { success: true; studentId: string; sessionVersion: number }
  | { success: false };

export async function verifyStudentPasswordResetOtp(
  nationalId: string,
  code: string,
): Promise<VerifyStudentOtpResult> {
  const otp = await prisma.studentOtp.findFirst({
    where: {
      consumedAt: null,
      student: {
        nationalId,
        isActive: true,
        studentAccount: { is: { isActive: true } },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      codeHash: true,
      expiresAt: true,
      attempts: true,
      student: {
        select: {
          id: true,
          studentAccount: { select: { sessionVersion: true } },
        },
      },
    },
  });

  if (!otp) {
    return { success: false };
  }

  if (otp.expiresAt < new Date()) {
    return { success: false };
  }

  if (otp.attempts >= 5) {
    return { success: false };
  }

  if (!verifyOtp(code, otp.codeHash)) {
    const updateResult = await prisma.studentOtp.updateMany({
      where: { id: otp.id, consumedAt: null, attempts: { lt: 5 } },
      data: { attempts: { increment: 1 } },
    });

    if (updateResult.count === 0) {
      return { success: false };
    }

    return { success: false };
  }

  const consumeResult = await prisma.studentOtp.updateMany({
    where: { id: otp.id, consumedAt: null, attempts: { lt: 5 } },
    data: { consumedAt: new Date() },
  });

  if (consumeResult.count === 0) {
    return { success: false };
  }

  return {
    success: true,
    studentId: otp.student.id,
    sessionVersion: otp.student.studentAccount!.sessionVersion,
  };
}
