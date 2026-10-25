import { prisma } from "@/lib/prisma";
import {
  performDummyStudentPasswordCheck,
  verifyStudentPassword,
} from "@/lib/auth/student-password";

type AdminPasswordLoginResult =
  | {
      success: true;
      userId: string;
      sessionVersion: number;
      mustChangePassword: boolean;
    }
  | { success: false };

export async function loginAdminWithPassword(
  nationalId: string,
  password: string,
): Promise<AdminPasswordLoginResult> {
  const user = await prisma.user.findFirst({
    where: {
      isActive: true,
      passwordHash: { not: null },
      staff: {
        is: {
          isActive: true,
          nationalId,
        },
      },
    },
    select: {
      id: true,
      passwordHash: true,
      sessionVersion: true,
      mustChangePassword: true,
    },
  });

  if (!user?.passwordHash) {
    await performDummyStudentPasswordCheck(password);
    return { success: false };
  }

  if (!(await verifyStudentPassword(password, user.passwordHash))) {
    return { success: false };
  }

  const update = await prisma.user.updateMany({
    where: {
      id: user.id,
      isActive: true,
      passwordHash: user.passwordHash,
      sessionVersion: user.sessionVersion,
      staff: {
        is: {
          isActive: true,
          nationalId,
        },
      },
    },
    data: { lastLoginAt: new Date() },
  });

  if (update.count !== 1) return { success: false };

  return {
    success: true,
    userId: user.id,
    sessionVersion: user.sessionVersion,
    mustChangePassword: user.mustChangePassword,
  };
}
