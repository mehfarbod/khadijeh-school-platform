import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "نمرات و کارنامه | دبیرستان شاهد حضرت خدیجه (ص)",
};

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function StudentGradesPage({ searchParams }: PageProps) {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/portal/login");
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
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
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
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">پرتال دانش‌آموز</p>
              <h1 className="mt-1 text-2xl font-bold">نمرات و کارنامه</h1>
            </div>
          </div>

          {selectedYear && (
            <div className="mt-5 rounded-xl bg-muted/50 p-4">
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
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
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
          )}
        </section>

        {!selectedYear ? (
          <section className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <p className="font-medium">سال تحصیلی برای نمایش پیدا نشد.</p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">تعداد نمرات</p>
                <p className="mt-2 text-2xl font-bold">{grades.length}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">تعداد درس‌ها</p>
                <p className="mt-2 text-2xl font-bold">{rows.length}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">میانگین نمرات ثبت‌شده</p>
                <p className="mt-2 text-2xl font-bold">{average ?? "—"}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">میانگین نوبت اول</p>
                <p className="mt-2 text-2xl font-bold">{firstTermAverage ?? "—"}</p>
              </div>
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">میانگین نوبت دوم</p>
                <p className="mt-2 text-2xl font-bold">{secondTermAverage ?? "—"}</p>
              </div>
            </section>

            <section className="rounded-2xl border bg-background p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold">کارنامه سال تحصیلی {selectedYear.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  نمرات ثبت‌شده هر درس و میانگین نمرات موجود در این سال تحصیلی.
                </p>
              </div>

              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  هنوز نمره‌ای برای این سال تحصیلی ثبت نشده است.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b text-right text-muted-foreground">
                        <th className="pb-3 font-medium">درس</th>
                        <th className="pb-3 text-center font-medium">مستمر نوبت اول</th>
                        <th className="pb-3 text-center font-medium">نوبت اول</th>
                        <th className="pb-3 text-center font-medium">مستمر نوبت دوم</th>
                        <th className="pb-3 text-center font-medium">نوبت دوم</th>
                        <th className="pb-3 text-center font-medium">میانگین درس</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.subject} className="border-b last:border-0">
                          <td className="py-3 font-medium">{row.subject}</td>
                          {row.grades.map((score, index) => (
                            <td key={index} className="py-3 text-center">{score}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b text-right text-muted-foreground">
                        <th className="pb-3 font-medium">درس</th>
                        <th className="pb-3 font-medium">عنوان</th>
                        <th className="pb-3 text-center font-medium">تاریخ</th>
                        <th className="pb-3 text-center font-medium">نمره</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">{item.subject}</td>
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
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
