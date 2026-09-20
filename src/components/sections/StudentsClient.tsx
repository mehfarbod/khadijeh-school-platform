"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  academicYear: string;
  photo: string | null;
  isActive: boolean;
}

const GRADES = ["دهم", "یازدهم", "دوازدهم"];

export default function StudentsClient() {
  const [students, setStudents] = useState<Student[] | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await fetch("/api/students?activeOnly=true");

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data: Student[] = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
        setStudents([]);
      }
    };

    loadStudents();
  }, []);

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose">
            دانش‌آموزان
          </p>

          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            دانش‌آموزان مدرسه
          </h1>

          <p className="text-sm text-muted-foreground">
            معرفی دانش‌آموزان فعال و موفق مدرسه
          </p>
        </div>

        {!students ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />

            <p className="text-sm text-muted-foreground">
              هنوز دانش‌آموزی ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {GRADES.map((grade) => {
              const gradeStudents = students.filter(
                (student) => student.grade === grade
              );

              if (gradeStudents.length === 0) {
                return null;
              }

              return (
                <div key={grade}>
                  <div className="mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />

                    <h2 className="text-lg font-semibold text-foreground">
                      پایه {grade}
                    </h2>

                    <span className="text-xs text-muted-foreground">
                      ({gradeStudents.length} نفر)
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {gradeStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5">
                          <span className="text-sm font-bold text-primary">
                            {student.firstName[0]}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {student.firstName} {student.lastName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            کلاس {student.className}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}