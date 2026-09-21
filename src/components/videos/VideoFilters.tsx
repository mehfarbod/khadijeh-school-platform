"use client";

import { cn } from "@/lib/utils";

export type VideoFilter =
  | "all"
  | "grade-10"
  | "grade-11"
  | "grade-12";

export type SubjectFilter =
  | "all"
  | "math"
  | "physics"
  | "chemistry"
  | "literature";

const gradeFilters: {
  value: VideoFilter;
  label: string;
}[] = [
  { value: "all", label: "همه پایه‌ها" },
  { value: "grade-10", label: "پایه دهم" },
  { value: "grade-11", label: "پایه یازدهم" },
  { value: "grade-12", label: "پایه دوازدهم" },
];

const subjectFilters: {
  value: SubjectFilter;
  label: string;
}[] = [
  { value: "all", label: "همه درس‌ها" },
  { value: "math", label: "ریاضی" },
  { value: "physics", label: "فیزیک" },
  { value: "chemistry", label: "شیمی" },
  { value: "literature", label: "ادبیات" },
];

interface VideoFiltersProps {
  activeGrade: VideoFilter;
  activeSubject: SubjectFilter;
  availableSubjects: SubjectFilter[];
  onGradeChange: (value: VideoFilter) => void;
  onSubjectChange: (value: SubjectFilter) => void;
}

export default function VideoFilters({
  activeGrade,
  activeSubject,
  availableSubjects,
  onGradeChange,
  onSubjectChange,
}: VideoFiltersProps) {
  const visibleSubjects = subjectFilters.filter(
    (subject) =>
      subject.value === "all" ||
      availableSubjects.includes(subject.value)
  );

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pt-10 sm:px-6">
      {/* Grade Filter */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[#194342]">
          پایه تحصیلی
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {gradeFilters.map((filter) => {
            const isActive = activeGrade === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onGradeChange(filter.value)}
                className={cn(
                  "shrink-0 rounded-[10px] px-[22px] py-[9px] text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[#194342] text-white"
                    : "border-[1.5px] border-[#DBE7C1] bg-[#FAF8F3] text-[#194342] hover:bg-[#DBE7C1]/30"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Filter — only after selecting a grade */}
      {activeGrade !== "all" && (
        <div className="mt-6">
          <h2 className="mb-4 text-sm font-semibold text-[#194342]">
            درس‌های این پایه
          </h2>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {visibleSubjects.map((subject) => {
              const isActive = activeSubject === subject.value;

              return (
                <button
                  key={subject.value}
                  type="button"
                  onClick={() => onSubjectChange(subject.value)}
                  className={cn(
                    "shrink-0 rounded-[10px] px-[22px] py-[9px] text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#B86F5B] text-white"
                      : "border-[1.5px] border-[#DBE7C1] bg-[#FAF8F3] text-[#194342] hover:bg-[#DBE7C1]/30"
                  )}
                >
                  {subject.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}