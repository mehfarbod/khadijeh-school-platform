"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  FlaskConical,
  GraduationCap,
  Palette,
  Users,
} from "lucide-react";

export type CourseStatus = "active" | "upcoming";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  grade: string;
  sessions: string;
  schedule: string;
  capacity: string;
  instructor: string;
  initials: string;
  status: CourseStatus;
  bgColor: string;
  icon: string;
}

const iconMap = {
  math: GraduationCap,
  life: Users,
  exam: BookOpen,
  research: FlaskConical,
  art: Palette,
  language: BookOpen,
};

export default function CourseCard({ course }: { course: Course }) {
  const [isHovered, setIsHovered] = useState(false);

  const Icon =
    iconMap[course.icon as keyof typeof iconMap] ?? BookOpen;

  const isActive = course.status === "active";

  return (
    <article
      className="overflow-hidden rounded-[18px] border border-[#DBE7C1] bg-white transition-all duration-200"
      style={{
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 8px 32px rgba(25,67,66,0.10)"
          : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course visual */}
      <div
        className="relative flex h-32 items-center justify-center"
        style={{ backgroundColor: course.bgColor }}
      >
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[16px] bg-white/65">
          <Icon
            className="h-7 w-7 text-[#194342]"
            strokeWidth={1.8}
          />
        </div>

        <span
          className={
            isActive
              ? "absolute left-3 top-3 rounded-full bg-[#194342] px-3 py-1 text-[11px] font-medium text-white"
              : "absolute left-3 top-3 rounded-full border border-[#DBE7C1] bg-[#EEF2F7] px-3 py-1 text-[11px] font-medium text-[#667085]"
          }
        >
          {isActive ? "در حال ثبت‌نام" : "به‌زودی"}
        </span>
      </div>

      {/* Course content */}
      <div className="p-5 pb-[18px]">
        <h3 className="min-h-14 text-[16px] font-bold leading-7 text-[#1F2933]">
          {course.title}
        </h3>

        <p className="mt-1.5 min-h-[47px] text-[13.5px] leading-[1.8] text-[#667085]">
          {course.description}
        </p>

        {/* Course information */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-2 text-[12px] text-[#667085]">
            <GraduationCap className="h-[15px] w-[15px] shrink-0 text-[#194342]" />
            <span>{course.grade}</span>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#667085]">
            <BookOpen className="h-[15px] w-[15px] shrink-0 text-[#194342]" />
            <span>{course.sessions}</span>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#667085]">
            <Clock3 className="h-[15px] w-[15px] shrink-0 text-[#194342]" />
            <span>{course.schedule}</span>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#667085]">
            <Users className="h-[15px] w-[15px] shrink-0 text-[#194342]" />
            <span>{course.capacity}</span>
          </div>
        </div>

        {/* Instructor */}
        <div className="mt-4 flex items-center gap-2.5 border-t border-[#EEF2F7] pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DBE7C1] text-xs font-bold text-[#194342]">
            {course.initials}
          </div>

          <div>
            <p className="text-[10.5px] text-[#667085]">
              مدرس دوره
            </p>

            <p className="mt-0.5 text-xs font-medium text-[#1F2933]">
              {course.instructor}
            </p>
          </div>
        </div>

        {/* Registration */}
        {isActive ? (
          <Link
  href={`/courses/registration?course=${encodeURIComponent(course.slug)}`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-[10px] bg-[#B86F5B] text-[12.5px] font-medium text-white transition-colors hover:bg-[#A45F4D]"
          >
            ثبت‌نام در دوره
          </Link>
        ) : (
          <div className="mt-4 flex h-10 w-full items-center justify-center rounded-[10px] border border-[#DBE7C1] bg-[#FAF8F3] text-[12.5px] font-medium text-[#667085]">
            ثبت‌نام به‌زودی
          </div>
        )}
      </div>
    </article>
  );
}