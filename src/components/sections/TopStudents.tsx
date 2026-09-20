"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

const students = [
  {
    name: "فاطمه محمدی",
    grade: "دهم ریاضی",
    achievement: "رتبه اول المپیاد ریاضی",
    initials: "ف",
  },
  {
    name: "زینب احمدی",
    grade: "یازدهم تجربی",
    achievement: "معدل ۲۰ — سه ترم متوالی",
    initials: "ز",
  },
  {
    name: "مریم حسینی",
    grade: "دوازدهم انسانی",
    achievement: "برگزیده مسابقات ادبی",
    initials: "م",
  },
  {
    name: "سارا رضایی",
    grade: "دهم تجربی",
    achievement: "قهرمان مسابقات علوم",
    initials: "س",
  },
  {
    name: "نرگس کریمی",
    grade: "یازدهم ریاضی",
    achievement: "رتبه اول کنکور آزمایشی",
    initials: "ن",
  },
  {
    name: "الهه موسوی",
    grade: "دوازدهم ریاضی",
    achievement: "برنده جایزه پژوهش برتر",
    initials: "ا",
  },
];

const CARD_WIDTH = 210;
const CARD_GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

export default function TopStudents() {
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

  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-6 py-16">
      <div className="mx-auto max-w-screen-xl">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-[22px] font-bold text-[#194342]">
              دانش‌آموزان برتر
            </h2>

            <p className="text-[13px] text-[#667085]">
              افتخارآفرینان مدرسه شاهد حضرت خدیجه (س)
            </p>
          </div>

          {/* Slider controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="حرکت به راست"
              onClick={() => moveSlider("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE7C1] text-[#194342] transition-all duration-200 hover:border-[#194342] hover:bg-[#FAF8F3]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="حرکت به چپ"
              onClick={() => moveSlider("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE7C1] text-[#194342] transition-all duration-200 hover:border-[#194342] hover:bg-[#FAF8F3]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          dir="ltr"
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {students.map((student) => (
            <article
              key={student.name}
              className="w-[210px] shrink-0 rounded-[18px] border border-[#DBE7C1] bg-[#FAF8F3] p-6"
            >
              {/* Initial */}
              <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#194342] to-[#3F5D3E] text-[26px] font-bold leading-none text-white">
                {student.initials}
              </div>

              {/* Student info */}
              <div className="text-center">
                <div className="mb-1 text-[14px] font-bold text-[#1F2933]">
                  {student.name}
                </div>

                <div className="mb-[10px] text-[12px] text-[#667085]">
                  {student.grade}
                </div>

                {/* Achievement */}
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
          ))}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}