import { prisma } from "@/lib/prisma";
import {
  hashStudentPassword,
  performDummyStudentPasswordCheck,
  verifyStudentPassword,
} from "@/lib/auth/student-password";

type StudentPasswordLoginResult =
  | {
      success: true;
      studentId: string;
      sessionVersion: number;
      mustChangePassword: boolean;
    }
  | { success: false };

export async function loginStudentWithPassword(
  nationalId: string,
  password: string,
): Promise<StudentPasswordLoginResult> {
  const student = await prisma.student.findUnique({
    where: { nationalId },
    select: {
      id: true,
      isActive: true,
      studentAccount: {
        select: {
          isActive: true,
          passwordHash: true,
        },
      },
    },
  });

  if (!student?.isActive || student.studentAccount?.isActive === false) {
    await performDummyStudentPasswordCheck(password);
    return { success: false };
  }

  const initialAccount = student.studentAccount;

  if (!initialAccount) {
    const initialPasswordHash = await hashStudentPassword(nationalId);
    await prisma.studentAccount.upsert({
      where: { studentId: student.id },
      create: {
        studentId: student.id,
        passwordHash: initialPasswordHash,
        mustChangePassword: true,
      },
      update: {},
    });
  } else if (!initialAccount.passwordHash) {
    const initialPasswordHash = await hashStudentPassword(nationalId);
    await prisma.studentAccount.updateMany({
      where: {
        studentId: student.id,
        isActive: true,
        passwordHash: null,
      },
      data: {
        passwordHash: initialPasswordHash,
        mustChangePassword: true,
      },
    });
  }

  const account = await prisma.studentAccount.findUnique({
    where: { studentId: student.id },
    select: {
      isActive: true,
      passwordHash: true,
      mustChangePassword: true,
      sessionVersion: true,
    },
  });

  if (
    !account?.isActive ||
    !account.passwordHash ||
    !(await verifyStudentPassword(password, account.passwordHash))
  ) {
    return { success: false };
  }

  await prisma.studentAccount.update({
    where: { studentId: student.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    success: true,
    studentId: student.id,
    sessionVersion: account.sessionVersion,
    mustChangePassword: account.mustChangePassword,
  };
}
