import { gradeSchema } from "@/lib/validation/student";

type EnrollmentWithAcademicYear = {
  grade: string;
  academicYear: { isCurrent: boolean };
};

export function getCurrentStudentEnrollment<
  T extends EnrollmentWithAcademicYear,
>(enrollments: T[]) {
  const currentEnrollments = enrollments.filter(
    (item) => item.academicYear.isCurrent,
  );

  return currentEnrollments.length === 1 ? currentEnrollments[0] : null;
}

export function getCurrentStudentGrade(
  enrollments: EnrollmentWithAcademicYear[],
) {
  const enrollment = getCurrentStudentEnrollment(enrollments);
  if (!enrollment) return null;

  const parsedGrade = gradeSchema.safeParse(enrollment.grade);
  return parsedGrade.success ? parsedGrade.data : null;
}
