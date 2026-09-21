"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, Play } from "lucide-react";
import { useState } from "react";

export type VideoSubject =
  | "math"
  | "physics"
  | "chemistry"
  | "literature";

export type VideoGrade =
  | "grade-10"
  | "grade-11"
  | "grade-12";

export type Video = {
  id: number;
  title: string;
  subject: VideoSubject;
  grade: VideoGrade;
  gradeLabel: string;
  duration: string;
  instructor: string;
  bgColor: string;
};

const subjectLabels: Record<VideoSubject, string> = {
  math: "ریاضی",
  physics: "فیزیک",
  chemistry: "شیمی",
  literature: "ادبیات",
};

export default function VideoCard({ video }: { video: Video }) {
  const [isHovered, setIsHovered] = useState(false);

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
      {/* Video Preview */}
      <div
        className="relative flex h-[170px] items-center justify-center"
        style={{ backgroundColor: video.bgColor }}
      >
        {/* Play Button */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <Play
            className="ml-0.5 h-6 w-6 text-[#194342]"
            fill="currentColor"
          />
        </div>

        {/* Subject Label */}
        <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10.5px] font-medium text-[#194342]">
          {subjectLabels[video.subject]}
        </span>

        {/* Duration */}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-[#194342]/90 px-2 py-1 text-[10.5px] text-white">
          <Clock3 className="h-3 w-3" />
          {video.duration}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Grade + Instructor */}
        <div className="flex items-center gap-2 text-[11.5px] text-[#667085]">
          <span>{video.gradeLabel}</span>

          <span className="text-[#CBD5D2]">•</span>

          <span>{video.instructor}</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 min-h-[48px] text-[15px] font-bold leading-6 text-[#1F2933]">
          {video.title}
        </h3>

        {/* Action */}
        <Link
          href={`/videos/${video.id}`}
          className="group mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#194342] transition-colors hover:text-[#B86F5B]"
        >
          <span>مشاهده ویدیو</span>

          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        </Link>
      </div>
    </article>
  );
}