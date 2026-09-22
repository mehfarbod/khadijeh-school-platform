"use client";

import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "+۳۵۰",
    label: "دانش‌آموز",
  },
  {
    icon: GraduationCap,
    value: "+۲۵",
    label: "کادر آموزشی",
  },
  {
    icon: Award,
    value: "۱۵+",
    label: "سال سابقه",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#194342] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/[0.06]" />

        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full border border-[#DBE7C1]/10" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:px-8 md:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1 text-[11px] font-medium text-white/75">
            <GraduationCap className="h-3.5 w-3.5 text-[#DBE7C1]" />
            <span>سال تحصیلی ۱۴۰۵–۱۴۰۶</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold leading-[1.35] tracking-tight sm:text-4xl lg:text-5xl">
            دبیرستان دخترانه
            <span className="mt-0.5 block text-[#DBE7C1]">
              شاهد حضرت خدیجه (س)
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-7 text-white/65 sm:text-sm lg:text-base">
            محیطی امن، پویا و الهام‌بخش برای رشد علمی، اخلاقی و خلاقانه
            دانش‌آموزان؛ جایی برای یادگیری، تجربه و ساختن آینده‌ای روشن.
          </p>

          {/* Actions */}
          <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Link
             href="/registration"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#DBE7C1] px-5 text-xs font-bold text-[#194342] transition-all hover:-translate-y-0.5 hover:bg-white sm:text-sm"
            >
              پیش‌ثبت‌نام مدرسه
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/courses"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#B86F5B] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#B86F5B]/90 sm:text-sm"
            >
              مشاهده دوره‌ها
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-5 grid max-w-lg grid-cols-3 border-t border-white/10 pt-3.5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-0.5 border-l border-white/10 px-2 text-center first:border-l-0"
                >
                  <Icon className="mb-0.5 h-3.5 w-3.5 text-[#BFD7EA]" />

                  <span className="text-base font-bold text-white sm:text-lg">
                    {stat.value}
                  </span>

                  <span className="text-[10px] text-white/45 sm:text-[11px]">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}