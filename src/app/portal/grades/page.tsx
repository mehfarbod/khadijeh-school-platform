import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "نمرات و کارنامه | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default async function StudentGradesPage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/portal/login");
  }

  const grades = await prisma.studentGrade.findMany({
    where: { studentId: student.id },
    include: { academicYear: true },
    orderBy: [{ academicYear: { startDate: "desc" } }, { subject: "asc" }],
  });

  const termOrder = ["مستمر نوبت اول", "نوبت اول", "مستمر نوبت دوم", "نوبت دوم"];
  const grouped = grades.reduce<Record<string, typeof grades>>((result, grade) => {
    const key = grade.academicYear.title;
    (result[key] ??= []).push(grade);
    return result;
  }, {});

  const orderedGroups = Object.entries(grouped).map(([year, items]) => {
    const subjects = Array.from(new Set(items.map((item) => item.subject)));
    return {
      year,
      rows: subjects.map((subject) => {
        const row = items.filter((item) => item.subject === subject);
        return {
          subject,
          grades: termOrder.map((term) => row.find((item) => item.term === term)?.score.toString() ?? "—"),
        };
      }),
    };
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
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">پرتال دانش‌آموز</p>
              <h1 className="mt-1 text-2xl font-bold">نمرات و کارنامه</h1>
            </div>
          </div>
        </section>

        {grades.length === 0 ? (
          <section className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <p className="font-medium">هنوز نمره‌ای برای شما ثبت نشده است.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              پس از ثبت نمرات توسط مدرس، اطلاعات کارنامه در این بخش نمایش داده می‌شود.
            </p>
          </section>
        ) : (
          orderedGroups.map((group) => (
            <section key={group.year} className="rounded-2xl border bg-background p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold">کارنامه سال تحصیلی {group.year}</h2>
                <p className="mt-1 text-xs text-muted-foreground">نمرات مستمر و پایانی به تفکیک هر درس</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b text-right text-muted-foreground">
                      <th className="pb-3 font-medium">درس</th>
                      <th className="pb-3 text-center font-medium">مستمر نوبت اول</th>
                      <th className="pb-3 text-center font-medium">نوبت اول</th>
                      <th className="pb-3 text-center font-medium">مستمر نوبت دوم</th>
                      <th className="pb-3 text-center font-medium">نوبت دوم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
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
            </section>
          ))                 </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
