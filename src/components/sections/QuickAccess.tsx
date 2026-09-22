"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Images,
  Newspaper,
  Video,
} from "lucide-react";

const quickAccessItems = [
  {
    title: "پیش‌ثبت‌نام مدرسه",
    action: "شروع پیش‌ثبت‌نام",
    href: "/registration",
    icon: GraduationCap,
  },
  {
    title: "دوره‌های آموزشی",
    action: "مشاهده دوره‌ها",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "اخبار و اطلاعیه‌ها",
    action: "مشاهده اخبار",
    href: "/news",
    icon: Newspaper,
  },
  {
    title: "برنامه‌های آموزشی",
    action: "مشاهده برنامه‌ها",
    href: "/programs",
    icon: CalendarDays,
  },
  {
    title: "ویدیوهای آموزشی",
    action: "مشاهده ویدیوها",
    href: "/videos",
    icon: Video,
  },
  {
    title: "گالری",
    action: "مشاهده گالری",
    href: "/gallery",
    icon: Images,
  },
];

export default function QuickAccess() {
  return (
    <section className="bg-[#FAF8F3] py-10 md:py-12">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <div className="mb-7 text-center">
          <span className="mb-2 block text-xs font-semibold text-[#3F5D3E]">
            دسترسی سریع
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-[#1F2933] sm:text-3xl">
            دسترسی به بخش‌های مهم
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#667085]">
            بخش‌های پرکاربرد مدرسه را سریع و ساده پیدا کنید.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex min-h-[145px] flex-col rounded-2xl border border-[#E5E8DE] bg-white px-4 py-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#CBD8BD] hover:shadow-[0_10px_25px_rgba(25,67,66,0.08)]"
              >
                {/* Icon */}
                <Icon
                  className="h-7 w-7 text-[#3F5D3E] transition-colors duration-300 group-hover:text-[#194342]"
                  strokeWidth={1.7}
                />

                {/* Title */}
                <h3 className="mt-4 text-sm font-bold leading-6 text-[#1F2933]">
                  {item.title}
                </h3>

                {/* Action */}
                <div className="mt-auto flex items-center gap-1 pt-5 text-[11px] font-medium text-[#667085] transition-colors duration-300 group-hover:text-[#194342]">
                  <span>{item.action}</span>

                  <ArrowLeft
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                    strokeWidth={1.8}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
