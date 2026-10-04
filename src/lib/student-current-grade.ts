import { gradeSchema } from "@/lib/validation/student";

type EnrollmentWithAcademicYear = {
  grade: string;
  academicYear: { isCurrent: boolean };
};

export function getCurrentStudentGrade(
  enrollments: EnrollmentWithAcademicYear[],
) {
  const enrollment = enrollments.find((item) => item.academicYear.isCurrent);
  if (!enrollment) return null;

  const parsedGrade = gradeSchema.safeParse(enrollment.grade);
  return parsedGrade.success ? parsedGrade.data : null;
}
