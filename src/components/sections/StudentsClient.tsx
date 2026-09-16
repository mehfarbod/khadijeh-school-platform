"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, GraduationCap } from "lucide-react";

const GRADES = ["دهم", "یازدهم", "دوازدهم"];

export default function StudentsClient() {
  const students = useQuery(api.students.list, { activeOnly: true });

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-2">
            دانش‌آموزان
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            دانش‌آموزان مدرسه
          </h1>
          <p className="text-sm text-muted-foreground">
            معرفی دانش‌آموزان فعال و موفق مدرسه
          </p>
        </div>

        {!students ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              هنوز دانش‌آموزی ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {GRADES.map((grade) => {
              const gradeStudents = students.filter((s) => s.grade === grade);
              if (gradeStudents.length === 0) return null;
              return (
                <div key={grade}>
                  <div className="flex items-center gap-2 mb-4">
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
                        key={student._id}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                          <span className="text-sm font-bold text-primary">
                            {student.firstName[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
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
