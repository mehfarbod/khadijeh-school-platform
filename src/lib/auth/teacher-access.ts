import { prisma } from "@/lib/prisma";

export async function getTeacherClassIds(
  teacherId: string,
  academicYearId?: string,
) {
  const assignments = await prisma.teacherClassAssignment.findMany({
    where: {
      teacherId,
      class: {
        isActive: true,
        ...(academicYearId ? { academicYearId } : {}),
      },
    },
    select: { classId: true },
  });

  return assignments.map((assignment) => assignment.classId);
}

export async function canTeacherAccessStudent(options: {
  teacherId: string;
  studentId: string;
  academicYearId: string;
  subject?: string | null;
}) {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: {
      studentId_academicYearId: {
        studentId: options.studentId,
        academicYearId: options.academicYearId,
      },
    },
    select: { classId: true },
  });

  if (!enrollment?.classId) {
    return false;
  }

  return canTeacherAccessClass({
    teacherId: options.teacherId,
    classId: enrollment.classId,
    subject: options.subject,
  });
}

export async function canTeacherAccessClass(options: {
  teacherId: string;
  classId: string;
  subject?: string | null;
}) {
  const subject = options.subject?.trim() || null;

  const assignment = await prisma.teacherClassAssignment.findFirst({
    where: {
      teacherId: options.teacherId,
      classId: options.classId,
      ...(subject
        ? {
            OR: [{ subject }, { subject: null }],
          }
        : {}),
      class: {
        isActive: true,
      },
    },
    select: { id: true },
  });

  return Boolean(assignment);
}

export async function assertTeacherCanAccessStudent(options: {
  teacherId: string;
  studentId: string;
  academicYearId: string;
  subject?: string | null;
}) {
  const allowed = await canTeacherAccessStudent(options);

  if (!allowed) {
    throw new Error("TEACHER_CLASS_FORBIDDEN");
  }
}
