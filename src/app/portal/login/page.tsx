import { redirect } from "next/navigation";

import StudentLoginForm from "@/components/student/StudentLoginForm";
import {
  getSafeStudentReturnTo,
  getStudentPasswordChangeUrl,
} from "@/lib/auth/student-return-to";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "ورود دانش‌آموزان | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default async function StudentPortalLoginPage({
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

  if (student?.studentAccount?.mustChangePassword) {
    redirect(getStudentPasswordChangeUrl(returnTo));
  }

  if (student) {
    redirect(returnTo);
  }

  return <StudentLoginForm returnTo={returnTo} />;
}
