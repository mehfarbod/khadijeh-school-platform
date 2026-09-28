"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

interface TopStudent {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  achievement: string;
}

const CARD_WIDTH = 210;
const CARD_GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

export default function TopStudents({
  students,
}: {
  students: TopStudent[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const moveSlider = (direction: "left" | "right") => {
    const slider = sliderRef.current;

    if (!slider) return;

    const amount =
      direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;

    slider.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  if (students.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-[22px] font-bold text-[#194342]">
              دانش‌آموزان برتر
            </h2>

            <p className="text-[13px] text-[#667085]">
              افتخارآفرینان مدرسه شاهد حضرت خدیجه (س)
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
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {students.map((student) => {
            const name = `${student.firstName} ${student.lastName}`;
            const initials =
              `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.trim();

            return (
              <article
                key={student.id}
                className="w-[210px] shrink-0 rounded-2xl border border-[#DBE7C1] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#194342] to-[#3F5D3E] text-[26px] font-bold leading-none text-white">
                  {initials}
                </div>

                <div className="text-center">
                  <div className="mb-1 text-[14px] font-bold text-[#1F2933]">
                    {name}
                  </div>

                  <div className="mb-[10px] text-[12px] text-[#667085]">
                    {student.grade}
                  </div>

                  <div className="flex items-center justify-center gap-1 rounded-lg bg-[#DBE7C1] px-[10px] py-[6px] text-[11.5px] font-semibold leading-5 text-[#194342]">
                    <Star
                      className="h-3 w-3 shrink-0"
                      fill="currentColor"
                      strokeWidth={1.5}
                    />

                    <span>{student.achievement}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div></section>
  );
}
