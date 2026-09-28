import Link from "next/link";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CoursesCTA() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: { _count: { select: { registrations: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  if (courses.length === 0) return null;

  return (
    <section className="bg-background py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-9 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose">
              دوره‌ها
            </p>
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              دوره‌های فعال آموزشی
            </h2>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const gradeBackground =
              course.gradeLevel === "10"
                ? "#194342"
                : course.gradeLevel === "11"
                  ? "#B86F5B"
                  : course.gradeLevel === "12"
                    ? "#DBE7C1"
                    : "#EEF2F7";

            const isDarkGrade =
              course.gradeLevel === "10" || course.gradeLevel === "11";

            const currentRegistrations = course._count.registrations;
            const isFull = currentRegistrations >= course.capacity;
            const percent =
              course.capacity > 0
                ? Math.round((currentRegistrations / course.capacity) * 100)
                : 0;

            const statusLabel =
              course.status.toLowerCase() === "active"
                ? "در حال ثبت‌نام"
                : course.status.toLowerCase() === "upcoming"
                  ? "به‌زودی"
                  : course.status;

            return (
              <Link
                key={course.id}
                href={`/courses/registration?course=${encodeURIComponent(course.slug)}`}
                className="block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div
                  className="flex items-center gap-2 px-5 py-4"
                  style={{ backgroundColor: gradeBackground }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <BookOpen
                      className={`h-4 w-4 ${isDarkGrade ? "text-white" : "text-[#194342]"}`}
                    />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isDarkGrade ? "bg-white/15 text-white" : "bg-white/65 text-[#194342]"}`}
                  >
                    {course.gradeLevel === "10"
                      ? "دهم"
                      : course.gradeLevel === "11"
                        ? "یازدهم"
                        : course.gradeLevel === "12"
                          ? "دوازدهم"
                          : "بدون پایه"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                    {course.description}
                  </p>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {currentRegistrations}/{course.capacity}
                      </span>
                      <span>{percent}%</span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : percent > 80 ? "bg-gold" : "bg-primary"}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${isFull ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-primary"}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
