import { prisma } from "@/lib/prisma";
import {
  hashStudentPassword,
  matchesInitialStudentPassword,
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

  if (initialAccount?.passwordHash) {
    if (!(await verifyStudentPassword(password, initialAccount.passwordHash))) {
      return { success: false };
    }

    return finalizeStudentLogin(
      student.id,
      nationalId,
      initialAccount.passwordHash,
    );
  }

  // Match the cost of an initialized password failure without persisting any
  // state. The initial credential itself is then compared in constant time.
  await performDummyStudentPasswordCheck(password);
  if (!matchesInitialStudentPassword(password, nationalId)) {
    return { success: false };
  }

  const initialPasswordHash = await hashStudentPassword(nationalId);
  const initialization = await initializeStudentAccount(
    student.id,
    nationalId,
    initialPasswordHash,
  );

  if (!initialization.success) return { success: false };

  if (
    !initialization.initialized &&
    !(await verifyStudentPassword(password, initialization.passwordHash))
  ) {
    return { success: false };
  }

  return finalizeStudentLogin(
    student.id,
    nationalId,
    initialization.passwordHash,
    initialization.sessionVersion,
  );
}

type InitializedAccount = {
  success: true;
  initialized: boolean;
  passwordHash: string;
  mustChangePassword: boolean;
  sessionVersion: number;
};

async function initializeStudentAccount(
  studentId: string,
  expectedNationalId: string,
  initialPasswordHash: string,
): Promise<InitializedAccount | { success: false }> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const [lockedStudent] = await tx.$queryRaw<
          Array<{ nationalId: string | null; isActive: boolean }>
        >`
          SELECT "nationalId", "isActive"
          FROM "Student"
          WHERE "id" = ${studentId}
          FOR UPDATE
        `;

        if (
          !lockedStudent?.isActive ||
          lockedStudent.nationalId !== expectedNationalId
        ) {
          return { success: false } as const;
        }

        const account = await tx.studentAccount.findUnique({
          where: { studentId },
          select: {
            isActive: true,
            passwordHash: true,
            mustChangePassword: true,
            sessionVersion: true,
          },
        });

        if (account && (!account.isActive || account.passwordHash)) {
          if (!account.isActive || !account.passwordHash) {
            return { success: false } as const;
          }

          return {
            success: true,
            initialized: false,
            passwordHash: account.passwordHash,
            mustChangePassword: account.mustChangePassword,
            sessionVersion: account.sessionVersion,
          } as const;
        }

        if (!account) {
          const createdAccount = await tx.studentAccount.create({
            data: {
              studentId,
              passwordHash: initialPasswordHash,
              mustChangePassword: true,
            },
            select: {
              passwordHash: true,
              mustChangePassword: true,
              sessionVersion: true,
            },
          });

          return {
            success: true,
            initialized: true,
            passwordHash: createdAccount.passwordHash!,
            mustChangePassword: createdAccount.mustChangePassword,
            sessionVersion: createdAccount.sessionVersion,
          } as const;
        }

        const updatedAccount = await tx.studentAccount.updateMany({
          where: {
            studentId,
            isActive: true,
            passwordHash: null,
          },
          data: {
            passwordHash: initialPasswordHash,
            mustChangePassword: true,
          },
        });

        if (updatedAccount.count === 1) {
          return {
            success: true,
            initialized: true,
            passwordHash: initialPasswordHash,
            mustChangePassword: true,
            sessionVersion: account.sessionVersion,
          } as const;
        }

        const currentAccount = await tx.studentAccount.findUnique({
          where: { studentId },
          select: {
            isActive: true,
            passwordHash: true,
            mustChangePassword: true,
            sessionVersion: true,
          },
        });

        if (!currentAccount?.isActive || !currentAccount.passwordHash) {
          return { success: false } as const;
        }

        return {
          success: true,
          initialized: false,
          passwordHash: currentAccount.passwordHash,
          mustChangePassword: currentAccount.mustChangePassword,
          sessionVersion: currentAccount.sessionVersion,
        } as const;
      });
    } catch (error) {
      if (attempt === 0 && isUniqueConstraintError(error)) continue;
      throw error;
    }
  }

  return { success: false };
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function finalizeStudentLogin(
  studentId: string,
  expectedNationalId: string,
  expectedPasswordHash: string,
  expectedSessionVersion?: number,
): Promise<StudentPasswordLoginResult> {
  return prisma.$transaction(async (tx) => {
    const [lockedStudent] = await tx.$queryRaw<
      Array<{ nationalId: string | null; isActive: boolean }>
    >`
      SELECT "nationalId", "isActive"
      FROM "Student"
      WHERE "id" = ${studentId}
      FOR UPDATE
    `;

    if (
      !lockedStudent?.isActive ||
      lockedStudent.nationalId !== expectedNationalId
    ) {
      return { success: false };
    }

    const account = await tx.studentAccount.findFirst({
      where: {
        studentId,
        isActive: true,
        passwordHash: expectedPasswordHash,
        ...(expectedSessionVersion !== undefined
          ? { sessionVersion: expectedSessionVersion }
          : {}),
      },
      select: {
        mustChangePassword: true,
        sessionVersion: true,
      },
    });

    if (!account) return { success: false };

    await tx.studentAccount.update({
      where: { studentId },
      data: { lastLoginAt: new Date() },
    });

    return {
      success: true,
      studentId,
      sessionVersion: account.sessionVersion,
      mustChangePassword: account.mustChangePassword,
    };
  });
}
