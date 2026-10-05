import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ClipboardList, GraduationCap, UserRound, ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";
import { getCurrentStudentEnrollment } from "@/lib/student-current-grade";
import StudentPortalShell from "@/components/student/StudentPortalShell";

export const metadata = {
  title: "پرتال دانش‌آموز | دبیرستان شاهد حضرت خدیجه (ص)",
};

const portalSections = [
  { href: "/portal/grades", title: "نمرات و کارنامه", description: "مشاهده نمرات، میانگین‌ها و ارزیابی‌های ثبت‌شده", icon: GraduationCap },
  { href: "/portal/courses", title: "دوره‌های من", description: "دوره‌های ثبت‌نام‌شده و وضعیت حضور در آن‌ها", icon: BookOpen },
  { href: "/portal/review-items", title: "موارد نیازمند بررسی", description: "غیبت‌ها، موارد انضباطی و پیگیری‌های مدرسه", icon: ClipboardList },
  { href: "/portal/profile", title: "پروفایل", description: "مشاهده و ویرایش اطلاعات قابل تغییر", icon: UserRound },
];

export default async function StudentPortalPage() {
  const student = await getAuthenticatedStudent();

  if (!student) redirect("/portal/login");
  if (student.studentAccount?.mustChangePassword) redirect("/portal/change-password");

  const enrollment = getCurrentStudentEnrollment(student.enrollments);
  const reviewCount = await prisma.studentReviewItem.count({
    where: { studentId: student.id, isVisible: true, status: "OPEN" },
  });

  return (
    <StudentPortalShell
      title="پرتال دانش‌آموز"
      description="دسترسی به اطلاعات آموزشی و پرتال دانش‌آموزی"
      showDashboardLink={false}
    >
        <section className="overflow-hidden rounded-2xl border border-[#E7E2DA] bg-white shadow-[0_12px_40px_rgba(26,35,50,0.06)]">
          <div className="h-1.5 bg-[#194342]" />
          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-medium text-[#98A2B3]">پرتال دانش‌آموز</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A2332]">سلام {student.firstName} {student.lastName}</h1>
                <p className="mt-2 text-sm text-[#667085]">
                  {enrollment?.grade ? `پایه ${enrollment.grade}` : "اطلاعات تحصیلی"}
                  {enrollment?.className ? ` · کلاس ${enrollment.className}` : ""}
                </p>
              </div>
              <Link href="/portal/profile" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#D5DECB] bg-[#FCFDF9] px-4 text-xs font-semibold text-[#194342] transition-colors hover:bg-[#F1F5E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2">
                <UserRound className="h-4 w-4" />
                مشاهده پروفایل
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <div className="rounded-lg bg-[#F1F5E8] px-3 py-2 text-xs text-[#194342]">
                سال تحصیلی: {enrollment?.academicYear.title ?? "ثبت نشده"}
              </div>
              {reviewCount > 0 ? (
                <div className="rounded-lg bg-[#FDF0EC] px-3 py-2 text-xs font-medium text-[#A45F4D]">{reviewCount} مورد نیازمند پیگیری</div>
              ) : (
                <div className="rounded-lg bg-[#F1F5E8] px-3 py-2 text-xs text-[#27745A]">مورد باز برای پیگیری ندارید</div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#1A2332]">دسترسی‌های پرتال</h2>
            <p className="mt-1 text-xs text-[#667085]">اطلاعات آموزشی و ارتباطی خود را از این بخش‌ها دنبال کنید.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {portalSections.map((section) => {
              const Icon = section.icon;
              const reviewBadge = section.href === "/portal/review-items" && reviewCount > 0;

              return (
                <Link key={section.href} href={section.href} className="group rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_8px_25px_rgba(26,35,50,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DECB] hover:shadow-[0_14px_35px_rgba(26,35,50,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5E8] text-[#194342] transition-colors group-hover:bg-[#DBE7C1]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <ArrowLeft className="h-4 w-4 text-[#98A2B3] transition-transform group-hover:-translate-x-1 group-hover:text-[#194342]" />
                  </div>
                  <div className="mt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#1A2332]">{section.title}</h3>
                      {reviewBadge ? <span className="rounded-full bg-[#B86F5B] px-2 py-0.5 text-[10px] font-bold text-white">{reviewCount}</span> : null}
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[#667085]">{section.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
    </StudentPortalShell>
  );
}
