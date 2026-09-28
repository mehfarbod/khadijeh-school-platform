"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, UserRoundX } from "lucide-react";

type DailyAbsence = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  dateKey: string;
};

export default function DailyAbsencesSlider({
  absences,
}: {
  absences: DailyAbsence[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const moveSlider = (direction: "left" | "right") => {
    sliderRef.current?.scrollBy({
      left: direction === "left" ? -376 : 376,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-[22px] font-bold text-[#194342]">
              دانش‌آموزان غایب
            </h2>
            <p className="text-[13px] text-[#667085]">
              اسامی دانش‌آموزان غایب امروز
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="حرکت به راست"
              onClick={() => moveSlider("right")}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#DBE7C1] text-[#194342] transition-all duration-200 hover:border-[#194342] hover:bg-[#FAF8F3]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="حرکت به چپ"
              onClick={() => moveSlider("left")}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#DBE7C1] text-[#194342] transition-all duration-200 hover:border-[#194342] hover:bg-[#FAF8F3]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          dir="rtl"
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {absences.map((student) => (
            <article
              key={student.id}
              className="w-[360px] shrink-0 rounded-2xl border border-[#DBE7C1] bg-[#FAF8F3] p-5"
            >
              <div className="flex items-center gap-4" dir="rtl">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F8ECE8] text-[#B86F5B]">
                  <UserRoundX className="h-7 w-7" strokeWidth={1.6} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#1F2933]">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="mt-1 text-xs text-[#667085]">{student.grade}</p>
                  <p className="mt-1 text-[11px] text-[#98A2B3]">
                    {new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                      dateStyle: "medium",
                    }).format(new Date(student.dateKey + "T12:00:00"))}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div></div>
    </section>
  );
}
