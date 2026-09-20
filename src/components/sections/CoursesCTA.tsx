"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  capacity: number;
  currentRegistrations: number;
  status: string;
}

export default function CoursesCTA() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch("/api/courses");

        if (!response.ok) {
          throw new Error("خطا در دریافت دوره‌ها");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      }
    };

    loadCourses();
  }, []);

  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-2">
              دوره‌ها
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              دوره‌های فعال آموزشی
            </h2>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {courses.slice(0, 4).map((course) => {
            const isFull =
              course.currentRegistrations >= course.capacity;

            const percent =
              course.capacity > 0
                ? Math.round(
                    (course.currentRegistrations / course.capacity) * 100
                  )
                : 0;

            return (
              <div
                key={course.id}
                className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>

                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {course.category}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {course.description}
                </p>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.currentRegistrations}/{course.capacity}
                    </span>

                    <span>{percent}%</span>
                  </div>

                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull
                          ? "bg-destructive"
                          : percent > 80
                            ? "bg-gold"
                            : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>

                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    isFull
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/5 text-primary"
                  }`}
                >
                  {course.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}