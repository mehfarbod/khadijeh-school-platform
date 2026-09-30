import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

export async function getCurrentStudent() {
  const session = await getServerSession(authOptions);

  if (session?.user?.accountType !== "student" || !session.user.studentId) {
    return null;
  }

  return prisma.student.findFirst({
    where: {
      id: session.user.studentId,
      isActive: true,
      studentAccount: { is: { isActive: true } },
    },
    include: {
      studentAccount: true,
      enrollments: {
        include: { academicYear: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function requireStudent() {
  const student = await getCurrentStudent();

  if (!student) {
    throw new Error("UNAUTHORIZED");
  }

  return student;
}
