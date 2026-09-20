"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Trophy } from "lucide-react";

interface TopStudent {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  achievement: string;
  academicYear: string;
  category: string | null;
  isActive: boolean;
}

const categoryColors: Record<string, string> = {
  "المپیاد": "bg-primary/5 text-primary",
  "علمی": "bg-gold/10 text-gold",
  "ورزشی": "bg-green-50 text-green-600",
  "فرهنگی": "bg-rose/10 text-rose",
  "کنکور": "bg-navy/10 text-navy",
};

export default function TopStudents() {
  const [students, setStudents] = useState<TopStudent[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        const response = await fetch("/api/top-students?activeOnly=true");

        if (!response.ok) {
          throw new Error("Failed to fetch top students");
        }

        const data: TopStudent[] = await response.json();

        if (!cancelled) {
          setStudents(data);
        }
      } catch (error) {
        console.error("Failed to load top students:", error);

        if (!cancelled) {
          setStudents([]);
        }
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = 280;

    scrollRef.current.scrollBy({
      left: dir === "left" ? amount : -amount,
      behavior: "smooth",
    });
  };

  if (!students) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-8" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 w-64 bg-muted rounded-xl animate-pulse shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (students.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-2">
              افتخارات
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              درخشش دانش‌آموزان ما
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="قبلی"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="بعدی"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {students.map((student) => (
            <div
              key={student.id}
              className="flex-shrink-0 w-64 snap-start rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/5">
                  <Trophy className="h-5 w-5 text-gold" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {student.firstName} {student.lastName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {student.grade}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 mb-3">
                <Star className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gold" />

                <p className="text-xs text-foreground leading-relaxed">
                  {student.achievement}
                </p>
              </div>

              {student.category && (
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    categoryColors[student.category] ||
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {student.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}