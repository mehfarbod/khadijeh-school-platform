"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, Award } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 geo-pattern opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/90 to-navy" />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-6 text-xs font-medium text-white/80">
              <GraduationCap className="h-3.5 w-3.5" />
              سال تحصیلی ۱۴۰۵-۱۴۰۴
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              دبیرستان دخترانه
              <br />
              <span className="text-gold">شاهد حضرت خدیجه (ص)</span>
            </h1>

            <p className="text-base md:text-lg text-white/70 max-w-lg mx-auto lg:mx-0 lg:mr-0 leading-relaxed mb-8">
              محیطی امن و الهام‌بخش برای رشد علمی، اخلاقی و خلاقانه دانش‌آموزان.
              تربیت نسلی متعهد، خلاق و مستقل.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
              >
                مشاهده دوره‌ها و ثبت‌نام
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                آشنایی با مدرسه
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: GraduationCap, label: "دانش‌آموز فعال", value: "+۳۵۰" },
              { icon: Users, label: "کادر آموزشی", value: "+۲۵" },
              { icon: Award, label: "سال سابقه", value: "۱۵+" },
              { icon: GraduationCap, label: "فارغ‌التحصیل موفق", value: "+۲۰۰۰" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm"
              >
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-gold" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
