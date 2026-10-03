import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import StudentPortalShell from "@/components/student/StudentPortalShell";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "دوره‌های من | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default async function StudentCoursesPage() {
  const student = await getAuthenticatedStudent();

  if (!student) {
    redirect("/portal/login");
  }

  if (student.studentAccount?.mustChangePassword) {
    redirect("/portal/change-password");
  }

  const registrations = await prisma.courseRegistration.findMany({
    where: { studentId: student.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به پرتال
        </Link>

        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">پرتال دانش‌آموز</p>
              <h1 className="mt-1 text-2xl font-bold">دوره‌های من</h1>
            </div>
          </div>
        </section>

        {registrations.length === 0 ? (
          <section className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <p className="font-medium">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              دوره‌های ثبت‌نام‌شده شما در این بخش نمایش داده می‌شوند.
            </p>
          </section>
        ) : (
          <div className="grid gap-4">
            {registrations.map((registration) => (
              <article
                key={registration.id}
                className="rounded-2xl border bg-background p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold">{registration.course.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {registration.course.instructor || "مدرس مشخص نشده"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs">
                    {registration.status === "PENDING"
                      ? "در انتظار بررسی"
                      : registration.status === "APPROVED"
                        ? "تأیید شده"
                        : registration.status === "REJECTED"
                          ? "رد شده"
                          : String(registration.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">زمان:</span>{" "}
                    {registration.course.schedule || "ثبت نشده"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">مدت:</span>{" "}
                    {registration.course.duration || "ثبت نشده"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">پایه:</span>{" "}
                    {registration.grade || "ثبت نشده"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
