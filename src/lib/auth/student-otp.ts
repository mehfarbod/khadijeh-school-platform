import { prisma } from "@/lib/prisma";
import { generateOtp, getOtpExpiration, hashOtp, verifyOtp } from "@/lib/auth/otp";
import { sendSmsOtp } from "@/lib/notifications/sms";

const GENERIC_MESSAGE =
  "اگر شماره موبایل واردشده مربوط به یک حساب فعال باشد، کد تأیید ارسال خواهد شد.";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function normalizeStudentIdentifier(value: string) {
  return normalizeDigits(value.trim()).replace(/\s+/g, "");
}

export async function requestStudentOtp(identifier: string) {
  const normalized = normalizeStudentIdentifier(identifier);

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      OR: [{ mobile: normalized }, { fatherMobile: normalized }],
    },
    select: { id: true, mobile: true, fatherMobile: true },
    take: 2,
  });

  if (students.length !== 1) {
    return { success: true, message: GENERIC_MESSAGE };
  }

  const student = students[0];
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

  await prisma.studentOtp.updateMany({
    where: { studentId: student.id, consumedAt: null },
    data: { consumedAt: now },
  });

  await prisma.studentOtp.create({
    data: {
      studentId: student.id,
      phone,
      codeHash: hashOtp(code),
      expiresAt: getOtpExpiration(),
    },
  });

  await sendSmsOtp({ to: phone, code });

  return { success: true, message: GENERIC_MESSAGE };
}

type VerifyStudentOtpResult =
  | { success: true; studentId: string }
  | { success: false; error: string; status: number };

export async function verifyStudentOtp(
  identifier: string,
  code: string
): Promise<VerifyStudentOtpResult> {
  const normalized = normalizeStudentIdentifier(identifier);

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      OR: [{ mobile: normalized }, { fatherMobile: normalized }],
    },
    select: { id: true },
    take: 2,
  });

  if (students.length !== 1) {
    return { success: false, error: "کد تأیید نامعتبر است.", status: 400 };
  }

  const student = students[0];
  const account = await prisma.studentAccount.findUnique({
    where: { studentId: student.id },
    select: { isActive: true },
  });

  if (!account?.isActive) {
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
    where: { id: otp.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  if (consumeResult.count === 0) {
    return {
      success: false,
      error: "کد تأیید قبلاً استفاده شده است.",
      status: 400,
    };
  }

  await prisma.studentAccount.update({
    where: { studentId: student.id },
    data: { lastLoginAt: new Date() },
  });

  return { success: true, studentId: student.id };
}
