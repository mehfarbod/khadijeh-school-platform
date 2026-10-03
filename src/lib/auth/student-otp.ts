import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiration, hashOtp, verifyOtp } from "@/lib/auth/otp";
import { sendSmsOtp } from "@/lib/notifications/sms";

const GENERIC_MESSAGE =
  "اگر کد ملی واردشده مربوط به یک حساب واجد شرایط باشد، کد تأیید ارسال خواهد شد.";

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
    return { success: true, message: GENERIC_MESSAGE };
  }

  const phone = student.mobile?.trim() || student.fatherMobile?.trim() || "";

  if (!phone) {
    return { success: true, message: GENERIC_MESSAGE };
  }

  await prisma.studentAccount.upsert({
    where: { studentId: student.id },
    create: { studentId: student.id, isActive: true },
    update: {},
  });

  const code = generateOtp();
  const now = new Date();

  await prisma.$transaction([
    prisma.studentOtp.updateMany({
      where: { studentId: student.id, consumedAt: null },
      data: { consumedAt: now },
    }),
    prisma.studentOtp.create({
      data: {
        studentId: student.id,
        phone,
        codeHash: hashOtp(code),
        expiresAt: getOtpExpiration(),
      },
    }),
  ]);

  // Provider-agnostic boundary: development logs the OTP, while production
  // deliberately fails closed until a real provider is configured here.
  await sendSmsOtp({ to: phone, code });

  return { success: true, message: GENERIC_MESSAGE };
}

type VerifyStudentOtpResult =
  | { success: true; studentId: string; sessionVersion: number }
  | { success: false; error: string; status: number };

export async function verifyStudentPasswordResetOtp(
  nationalId: string,
  code: string,
): Promise<VerifyStudentOtpResult> {
  const student = await prisma.student.findUnique({
    where: { nationalId },
    select: {
      id: true,
      isActive: true,
      studentAccount: {
        select: { isActive: true, sessionVersion: true },
      },
    },
  });

  if (!student?.isActive || !student.studentAccount?.isActive) {
    return { success: false, error: "کد تأیید نامعتبر است.", status: 400 };
  }

  const otp = await prisma.studentOtp.findFirst({
    where: { studentId: student.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return {
      success: false,
      error: "کد تأیید نامعتبر یا منقضی شده است.",
      status: 400,
    };
  }

  if (otp.expiresAt < new Date()) {
    return { success: false, error: "کد تأیید منقضی شده است.", status: 400 };
  }

  if (otp.attempts >= 5) {
    return {
      success: false,
      error: "تعداد تلاش‌های مجاز به پایان رسیده است.",
      status: 429,
    };
  }

  if (!verifyOtp(code, otp.codeHash)) {
    const updateResult = await prisma.studentOtp.updateMany({
      where: { id: otp.id, consumedAt: null, attempts: { lt: 5 } },
      data: { attempts: { increment: 1 } },
    });

    if (updateResult.count === 0) {
      return {
        success: false,
        error: "تعداد تلاش‌های مجاز به پایان رسیده است.",
        status: 429,
      };
    }

    return { success: false, error: "کد تأیید نادرست است.", status: 400 };
  }

  const consumeResult = await prisma.studentOtp.updateMany({
    where: { id: otp.id, consumedAt: null, attempts: { lt: 5 } },
    data: { consumedAt: new Date() },
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
    studentId: student.id,
    sessionVersion: student.studentAccount.sessionVersion,
  };
}
