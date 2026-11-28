import { School } from "lucide-react";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { formatPersianGrade } from "@/lib/persian";
import { prisma } from "@/lib/prisma";
import StudentIllustrationPlaceholder from "@/components/ui/StudentIllustrationPlaceholder";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    select: {
      title: true,
      classes: {
        where: { isActive: true },
        orderBy: [{ grade: "asc" }, { name: "asc" }],
        select: {
          id: true,
          grade: true,
          name: true,
          enrollments: {
            where: { student: { isActive: true } },
            orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
            select: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <>
      <Header />
      <main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-[22px] border border-[#DBE7C1] bg-white p-7 sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DBE7C1]/60">
              <School className="h-7 w-7 text-[#194342]" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-[#194342]">کلاس‌ها</h1>
            <p className="mt-3 text-sm leading-8 text-[#667085]">
              کلاس‌های فعال {currentYear ? `سال تحصیلی ${currentYear.title}` : "مدرسه"} در این بخش نمایش داده می‌شوند.
            </p>
          </div>

          {currentYear?.classes.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {currentYear.classes.map((schoolClass) => (
                <article key={schoolClass.id} className="rounded-2xl border border-[#DBE7C1] bg-white p-5">
                  <p className="text-xs font-semibold text-[#667085]">{formatPersianGrade(schoolClass.grade)}</p>
                  <h2 className="mt-2 text-base font-bold text-[#194342]">کلاس {schoolClass.name}</h2>
                  {schoolClass.enrollments.length ? (
                    <ul className="mt-4 divide-y divide-[#EEEAE3] border-t border-[#EEEAE3]">
                      {schoolClass.enrollments.map((enrollment, index) => (
                        <li
                          key={`${enrollment.student.firstName}-${enrollment.student.lastName}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                        >
                          <span className="flex items-center gap-3 font-semibold text-[#1F2933]">
                            <StudentIllustrationPlaceholder variant="class-list" className="w-10 rounded-xl" />
                            <span>{enrollment.student.firstName} {enrollment.student.lastName}</span>
                          </span>
                          <span className="rounded-full border border-[#CFE4C4] bg-[#F1F8ED] px-2.5 py-1 text-[11px] font-semibold text-[#27745A]">
                            ثبت‌نام تأیید شده
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 border-t border-[#EEEAE3] pt-4 text-xs text-[#98A2B3]">
                      دانش‌آموز تأییدشده‌ای در این کلاس ثبت نشده است.
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#DBE7C1] bg-white p-10 text-center text-sm text-[#667085]">
              هنوز کلاس فعالی برای نمایش ثبت نشده است.
            </div>
          )}
        </div>
      </main>
      <CoursesFooter />
    </>
  );
}
