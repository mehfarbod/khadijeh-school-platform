import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";
import StudentLogoutButton from "@/components/student/StudentLogoutButton";

export const metadata = {
  title: "پرتال دانش‌آموز | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default async function StudentPortalPage() {
  const student = await getAuthenticatedStudent();

  if (!student) {
    redirect("/portal/login");
  }

  if (student.studentAccount?.mustChangePassword) {
    redirect("/portal/change-password");
  }

  const enrollment = student.enrollments[0];

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">پرتال دانش‌آموز</p>
          <h1 className="mt-2 text-2xl font-bold">
            سلام {student.firstName} {student.lastName} 👋
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {enrollment?.grade ? "پایه " + enrollment.grade : "اطلاعات تحصیلی"}
              {enrollment?.className ? " · کلاس " + enrollment.className : ""}
            </p>
            <StudentLogoutButton />
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/portal/grades" className="rounded-2xl border bg-background p-5 shadow-sm">
            <h2 className="font-semibold">نمرات و کارنامه</h2>
            <p className="mt-2 text-sm text-muted-foreground">مشاهده نمرات ثبت‌شده</p>
          </Link>
          <Link href="/portal/courses" className="rounded-2xl border bg-background p-5 shadow-sm">
            <h2 className="font-semibold">دوره‌های من</h2>
            <p className="mt-2 text-sm text-muted-foreground">دوره‌های ثبت‌نام‌شده</p>
          </Link>
          <Link href="/portal/profile" className="rounded-2xl border bg-background p-5 shadow-sm">
            <h2 className="font-semibold">پروفایل</h2>
            <p className="mt-2 text-sm text-muted-foreground">اطلاعات حساب دانش‌آموز</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
