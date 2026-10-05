import { redirect } from "next/navigation";

import StudentChangePasswordForm from "@/components/student/StudentChangePasswordForm";
import { getSafeStudentReturnTo, getStudentLoginUrl } from "@/lib/auth/student-return-to";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "تغییر رمز عبور | پرتال دانش‌آموز",
};

export default async function StudentChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeStudentReturnTo(requestedReturnTo);
  const student = await getAuthenticatedStudent();

  if (!student) {
    redirect(getStudentLoginUrl(returnTo));
  }

  if (!student.studentAccount?.mustChangePassword) {
    redirect(returnTo);
  }

  return <StudentChangePasswordForm returnTo={returnTo} />;
}
