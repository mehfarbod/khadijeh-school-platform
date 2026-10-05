import Link from "next/link";
import { redirect } from "next/navigation";
import StudentPortalShell from "@/components/student/StudentPortalShell";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "نمرات و کارنامه | دبیرستان شاهد حضرت خدیجه (ص)",
};

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function StudentGradesPage({ searchParams }: PageProps) {
  const student = await getAuthenticatedStudent();

  if (!student) {
    redirect("/portal/login");
  }

  if (student.studentAccount?.mustChangePassword) {
    redirect("/portal/change-password");
  }

  const params = await searchParams;
  const enrollmentYears = student.enrollments.map((enrollment) => enrollment.academicYear);
  const uniqueYears = Array.from(
    new Map(enrollmentYears.map((year) => [year.id, year])).values(),
  ).sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0);
  });

  const selectedYear =
    uniqueYears.find((year) => year.id === params.year) ??
    uniqueYears.find((year) => year.isCurrent) ??
    uniqueYears[0] ??
    null;

  const [grades, assessments] = selectedYear
    ? await Promise.all([
        prisma.studentGrade.findMany({
          where: { studentId: student.id, academicYearId: selectedYear.id },
          orderBy: [{ subject: "asc" }, { term: "asc" }],
        }),
        prisma.studentAssessment.findMany({
          where: { studentId: student.id, academicYearId: selectedYear.id },
          orderBy: [{ assessmentDate: "desc" }, { createdAt: "desc" }],
        }),
      ])
    : [[], []];

  const enrollment = selectedYear
    ? student.enrollments.find((item) => item.academicYearId === selectedYear.id)
    : null;

  const termOrder = ["مستمر نوبت اول", "نوبت اول", "مستمر نوبت دوم", "نوبت دوم"];

  const subjects = Array.from(new Set(grades.map((item) => item.subject)));
  const rows = subjects.map((subject) => {
    const row = grades.filter((item) => item.subject === subject);
    const scores = row.map((item) => Number(item.score));
    const subjectAverage =
      scores.length > 0
        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
        : null;

    const firstTermScores = row
      .filter((item) => item.term === "مستمر نوبت اول" || item.term === "نوبت اول")
      .map((item) => Number(item.score));
    const secondTermScores = row
      .filter((item) => item.term === "مستمر نوبت دوم" || item.term === "نوبت دوم")
      .map((item) => Number(item.score));

    return {
      subject,
      grades: termOrder.map(
        (term) => row.find((item) => item.term === term)?.score.toString() ?? "—",
      ),
      firstTermAverage:
        firstTermScores.length > 0
          ? (firstTermScores.reduce((sum, score) => sum + score, 0) / firstTermScores.length).toFixed(2)
          : "—",
      secondTermAverage:
        secondTermScores.length > 0
          ? (secondTermScores.reduce((sum, score) => sum + score, 0) / secondTermScores.length).toFixed(2)
          : "—",
      subjectAverage: subjectAverage ?? "—",
    };
  });

  const scoreValues = grades.map((item) => Number(item.score));
  const average =
    scoreValues.length > 0
      ? (scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length).toFixed(2)
      : null;

  const firstTermScores = grades
    .filter((item) => item.term === "مستمر نوبت اول" || item.term === "نوبت اول")
    .map((item) => Number(item.score));
  const secondTermScores = grades
    .filter((item) => item.term === "مستمر نوبت دوم" || item.term === "نوبت دوم")
    .map((item) => Number(item.score));

  const firstTermAverage =
    firstTermScores.length > 0
      ? (firstTermScores.reduce((sum, score) => sum + score, 0) / firstTermScores.length).toFixed(2)
      : null;
  const secondTermAverage =
    secondTermScores.length > 0
      ? (secondTermScores.reduce((sum, score) => sum + score, 0) / secondTermScores.length).toFixed(2)
      : null;

  return (
    <StudentPortalShell title="نمرات و کارنامه" description="نمرات، میانگین‌ها و ارزیابی‌های ثبت‌شده">
        {selectedYear && (
          <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">سال تحصیلی</p>
                  <p className="mt-1 font-semibold">{selectedYear.title}</p>
                </div>
                {enrollment && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">پایه:</span> {enrollment.grade}
                    {enrollment.className ? (
                      <>
                        <span className="mx-2 text-muted-foreground">·</span>
                        <span className="text-muted-foreground">کلاس:</span> {enrollment.className}
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              {uniqueYears.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {uniqueYears.map((year) => (
                    <Link
                      key={year.id}
                      href={`/portal/grades?year=${year.id}`}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2 ${
                        selectedYear.id === year.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      {year.title}
                      {year.isCurrent ? " · جاری" : ""}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!selectedYear ? (
          <section className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <p className="font-medium">سال تحصیلی برای نمایش پیدا نشد.</p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-2">
                <p className="text-sm text-muted-foreground">تعداد نمرات</p>
                <p className="mt-2 text-2xl font-bold">{grades.length}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-2">
                <p className="text-sm text-muted-foreground">تعداد درس‌ها</p>
                <p className="mt-2 text-2xl font-bold">{rows.length}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-2">
                <p className="text-sm text-muted-foreground">میانگین نمرات ثبت‌شده تا این لحظه</p>
                <p className="mt-2 text-2xl font-bold">{average ?? "—"}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-3">
                <p className="text-sm text-muted-foreground">میانگین نوبت اول</p>
                <p className="mt-2 text-2xl font-bold">{firstTermAverage ?? "—"}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-3">
                <p className="text-sm text-muted-foreground">میانگین نوبت دوم</p>
                <p className="mt-2 text-2xl font-bold">{secondTermAverage ?? "—"}</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-background p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold">کارنامه سال تحصیلی {selectedYear.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  نمرات ثبت‌شده هر درس و میانگین نمرات موجود تا این لحظه در سال تحصیلی.
                </p>
              </div>

              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  هنوز نمره‌ای برای این سال تحصیلی ثبت نشده است.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-muted-foreground sm:hidden">
                    برای مشاهده همه ستون‌ها، جدول را به چپ و راست بکشید.
                  </p>
                  <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="جدول کارنامه">
                  <table className="w-full min-w-[760px] text-sm">
                    <caption className="sr-only">کارنامه سال تحصیلی {selectedYear.title}</caption>
                    <thead>
                      <tr className="border-b text-right text-muted-foreground">
                        <th scope="col" className="pb-3 font-medium">درس</th>
                        <th scope="col" className="pb-3 text-center font-medium">مستمر نوبت اول</th>
                        <th scope="col" className="pb-3 text-center font-medium">نوبت اول</th>
                        <th scope="col" className="pb-3 text-center font-medium">مستمر نوبت دوم</th>
                        <th scope="col" className="pb-3 text-center font-medium">نوبت دوم</th>
                        <th scope="col" className="pb-3 text-center font-medium">میانگین درس</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.subject} className="border-b last:border-0">
                          <th scope="row" className="py-3 text-right font-medium">{row.subject}</th>
                          {row.grades.map((score, index) => (
                            <td key={index} className="py-3 text-center">{score}</td>
                          ))}
                          <td className="py-3 text-center">{row.subjectAverage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
            </section>

            <section className="rounded-2xl border bg-background p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold">ارزیابی‌های هفتگی</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  آزمون‌ها و فعالیت‌های هفتگی ثبت‌شده توسط مدرس
                </p>
              </div>

              {assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  هنوز ارزیابی هفتگی برای این سال تحصیلی ثبت نشده است.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-muted-foreground sm:hidden">
                    برای مشاهده همه ستون‌ها، جدول را به چپ و راست بکشید.
                  </p>
                  <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="جدول ارزیابی‌های هفتگی">
                  <table className="w-full min-w-[720px] text-sm">
                    <caption className="sr-only">ارزیابی‌های هفتگی</caption>
                    <thead>
                      <tr className="border-b text-right text-muted-foreground">
                        <th scope="col" className="pb-3 font-medium">درس</th>
                        <th scope="col" className="pb-3 font-medium">عنوان</th>
                        <th scope="col" className="pb-3 text-center font-medium">تاریخ</th>
                        <th scope="col" className="pb-3 text-center font-medium">نمره</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <th scope="row" className="py-3 text-right font-medium">{item.subject}</th>
                          <td className="py-3">{item.title}</td>
                          <td className="py-3 text-center">
                            {item.assessmentDate
                              ? new Intl.DateTimeFormat("fa-IR").format(item.assessmentDate)
                              : "—"}
                          </td>
                          <td className="py-3 text-center">{item.score.toString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
            </section>
          </>
        )}
    </StudentPortalShell>
  );
}
