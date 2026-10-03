import { redirect } from "next/navigation";

import StudentChangePasswordForm from "@/components/student/StudentChangePasswordForm";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "تغییر رمز عبور | پرتال دانش‌آموز",
};

export default async function StudentChangePasswordPage() {
  const student = await getAuthenticatedStudent();

  if (!student) {
    redirect("/portal/login");
  }

  if (!student.studentAccount?.mustChangePassword) {
    redirect("/portal");
  }

  return <StudentChangePasswordForm />;
}
