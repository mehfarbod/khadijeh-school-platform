"use client";

import Link from "next/link";
import { BookOpen, Clock3, GraduationCap, Users } from "lucide-react";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  gradeLevel: string | null;
  duration: string | null;
  schedule: string | null;
  capacity: number;
  currentRegistrations: number;
  instructor: string | null;
  status: "active" | "upcoming";
  coverImage: string | null;
  category: string;
}

export default function CourseCard({ course }: { course: Course }) {
  const active = course.status === "active";
  const full = course.currentRegistrations >= course.capacity;

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#DBE7C1] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(25,67,66,0.10)]">
      <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="block">
        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-[#DBE7C1]">
          {course.coverImage ? <img src={course.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <BookOpen className="h-9 w-9 text-[#194342]" strokeWidth={1.6} />}
          <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-[#194342]">{active ? (full ? "تکمیل ظرفیت" : "در حال ثبت‌نام") : "به‌زودی"}</span>
        </div>
      </Link>
      <div className="p-5 pb-[18px]">
        <Link href={`/courses/${encodeURIComponent(course.slug)}`}>
          <h3 className="min-h-14 text-[16px] font-bold leading-7 text-[#1F2933] hover:text-[#194342]">{course.title}</h3>
        </Link>
        <p className="mt-1.5 min-h-[47px] text-[13.5px] leading-[1.8] text-[#667085]">{course.description}</p>
        <div className="mt-4 space-y-2.5">
          {course.gradeLevel && <div className="flex items-center gap-2 text-[12px] text-[#667085]"><GraduationCap className="h-[15px] w-[15px] text-[#194342]"/><span>{course.gradeLevel}</span></div>}
          {course.duration && <div className="flex items-center gap-2 text-[12px] text-[#667085]"><BookOpen className="h-[15px] w-[15px] text-[#194342]"/><span>{course.duration}</span></div>}
          {course.schedule && <div className="flex items-center gap-2 text-[12px] text-[#667085]"><Clock3 className="h-[15px] w-[15px] text-[#194342]"/><span>{course.schedule}</span></div>}
          <div className="flex items-center gap-2 text-[12px] text-[#667085]"><Users className="h-[15px] w-[15px] text-[#194342]"/><span>ظرفیت {course.capacity} نفر · {course.currentRegistrations} ثبت‌نام</span></div>
        </div>
        {course.instructor && <div className="mt-4 border-t border-[#EEF2F7] pt-4 text-xs text-[#667085]">مدرس دوره: <span className="font-medium text-[#1F2933]">{course.instructor}</span></div>}
        {active && !full ? <Link href={`/courses/registration?course=${encodeURIComponent(course.slug)}`} className="mt-4 flex h-10 w-full items-center justify-center rounded-[10px] bg-[#B86F5B] text-[12.5px] font-medium text-white hover:bg-[#A45F4D]">ثبت‌نام در دوره</Link> : <div className="mt-4 flex h-10 w-full items-center justify-center rounded-[10px] border border-[#DBE7C1] bg-[#FAF8F3] text-[12.5px] font-medium text-[#667085]">{full ? "ظرفیت تکمیل شده" : "ثبت‌نام به‌زودی"}</div>}
      </div>
    </article>
  );
}
