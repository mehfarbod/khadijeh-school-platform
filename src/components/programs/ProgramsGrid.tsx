"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  UsersRound,
  HeartHandshake,
  ArrowLeft,
} from "lucide-react";

const programs = [
  {
    title: "برنامه هفتگی",
    description:
      "برنامه کلاس‌ها و فعالیت‌های آموزشی دانش‌آموزان را مشاهده کنید.",
    icon: CalendarDays,
    href: "/programs/weekly",
    accent: "#DBE7C1",
  },
  {
    title: "برنامه امتحانات",
    description:
      "زمان‌بندی امتحانات و آزمون‌های مدرسه را در یکجا ببینید.",
    icon: ClipboardList,
    href: "/programs/exams",
    accent: "#BFD7EA",
  },
  {
    title: "تقویم آموزشی",
    description:
      "تاریخ‌های مهم، مناسبت‌ها و رویدادهای آموزشی مدرسه.",
    icon: GraduationCap,
    href: "/programs/calendar",
    accent: "#EEF2F7",
  },
  {
    title: "جلسات انجمن اولیا و مربیان",
    description:
      "اطلاعیه‌ها، زمان‌بندی و اطلاعات مربوط به جلسات انجمن اولیا و مربیان.",
    icon: UsersRound,
    href: "/programs/parents-meetings",
    accent: "#E8DFC8",
  },
  {
    title: "جلسات مشاوره خانواده",
    description:
      "اطلاعات و زمان‌بندی جلسات مشاوره خانواده و برنامه‌های مرتبط با والدین.",
    icon: HeartHandshake,
    href: "/programs/family-counseling",
    accent: "#F0DDD8",
  },
];

export default function ProgramsGrid() {
  return (
    <section className="bg-[#FAF8F3] px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="text-center">
          <h2 className="text-[22px] font-bold text-[#194342]">
            بخش‌های برنامه آموزشی
          </h2>

          <p className="mx-auto mt-2 max-w-[520px] text-[13px] leading-7 text-[#667085]">
            اطلاعات آموزشی موردنیاز خود را از بخش مربوطه مشاهده کنید.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon;

            return (
              <Link
                key={program.href}
                href={program.href}
                className="group rounded-[18px] border border-[#DBE7C1] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(25,67,66,0.10)]"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[16px]"
                  style={{ backgroundColor: program.accent }}
                >
                  <Icon
                    className="h-7 w-7 text-[#194342]"
                    strokeWidth={1.8}
                  />
                </div>

                <h3 className="mt-5 text-[16px] font-bold text-[#1F2933]">
                  {program.title}
                </h3>

                <p className="mt-2 text-[13px] leading-[1.9] text-[#667085]">
                  {program.description}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#194342] transition-colors group-hover:text-[#B86F5B]">
                  <span>مشاهده برنامه</span>
                  <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}