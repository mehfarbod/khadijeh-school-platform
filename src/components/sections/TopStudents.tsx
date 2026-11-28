"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Medal } from "lucide-react";
import StudentIllustrationPlaceholder from "@/components/ui/StudentIllustrationPlaceholder";

interface TopStudent {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  achievement: string;
  className: string | null;
  rank: number | null;
}

const rankStyles: Record<number, { label: string; color: string; background: string }> = {
  1: { label: "رتبه اول", color: "#9A6A00", background: "#FFF4C7" },
  2: { label: "رتبه دوم", color: "#667085", background: "#EEF2F6" },
  3: { label: "رتبه سوم", color: "#9A5B35", background: "#F4DFD0" },
};

export default function TopStudents({ students }: { students: TopStudent[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const moveSlider = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;
    slider.scrollBy({ left: direction === "left" ? -slider.clientWidth : slider.clientWidth, behavior: "smooth" });
  };

  if (!students.length) return null;

  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-center justify-between gap-4">
          <div>
            <h2 className="mb-1 text-[22px] font-bold text-[#194342]">دانش‌آموزان برتر</h2>
            <p className="text-[13px] text-[#667085]">سه رتبه برتر هر کلاس</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="صفحه قبلی" onClick={() => moveSlider("right")} className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#DBE7C1] text-[#194342] hover:border-[#194342]"><ArrowRight className="h-4 w-4" /></button>
            <button type="button" aria-label="صفحه بعدی" onClick={() => moveSlider("left")} className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#DBE7C1] text-[#194342] hover:border-[#194342]"><ArrowLeft className="h-4 w-4" /></button>
          </div>
        </div>
        <div ref={sliderRef} dir="rtl" className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 lg:gap-4">
          {students.map((student) => {
            const rank = student.rank ?? 3;
            const style = rankStyles[rank] ?? rankStyles[3];
            return (
              <article key={student.id} className="w-[calc((100%_-_1.5rem)/3)] min-w-0 shrink-0 snap-start rounded-2xl border border-[#DBE7C1] bg-white p-4 text-center shadow-sm lg:w-[calc((100%_-_5rem)/6)]">
                <div className="relative mx-auto w-fit"><StudentIllustrationPlaceholder variant="top" className="w-14" /><span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white" style={{ color: style.color, backgroundColor: style.background }}><Medal className="h-3.5 w-3.5" /></span></div>
                <p className="mt-3 truncate text-[13px] font-bold text-[#1F2933]" title={`${student.firstName} ${student.lastName}`}>{student.firstName} {student.lastName}</p>
                <p className="mt-1 truncate text-[11px] text-[#667085]">کلاس {student.className}</p>
                <span className="mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-bold" style={{ color: style.color, backgroundColor: style.background }}>{style.label}</span>
                <p className="mt-3 line-clamp-2 text-[10.5px] leading-5 text-[#667085]">{student.achievement}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
