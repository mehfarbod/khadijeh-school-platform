import Link from "next/link";
import { redirect } from "next/navigation";
import StudentPortalShell from "@/components/student/StudentPortalShell";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";
import { getPersianGradeName } from "@/lib/persian";

const registrationStatusLabels = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
  CANCELLED: "لغو شده",
} as const;

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
    select: {
      id: true,
      status: true,
      grade: true,
      course: {
        select: {
          title: true,
          instructor: true,
          schedule: true,
          duration: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <StudentPortalShell title="دوره‌های من" description="دوره‌های ثبت‌نام‌شده و وضعیت ثبت‌نام">
        {registrations.length === 0 ? (
          <section className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <p className="font-medium">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              دوره‌های ثبت‌نام‌شده شما در این بخش نمایش داده می‌شوند.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#194342] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#123332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2"
            >
              مشاهده دوره‌ها
            </Link>
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
                    {registrationStatusLabels[registration.status]}
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
                    {getPersianGradeName(registration.grade) || "ثبت نشده"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
    </StudentPortalShell>
  );
}
