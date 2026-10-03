import { redirect } from "next/navigation";

import StudentLoginForm from "@/components/student/StudentLoginForm";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "ورود دانش‌آموزان | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default async function StudentPortalLoginPage() {
  const student = await getAuthenticatedStudent();

  if (student?.studentAccount?.mustChangePassword) {
    redirect("/portal/change-password");
  }

  if (student) {
    redirect("/portal");
  }

  return <StudentLoginForm />;
}
