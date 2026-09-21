
"use client";

import { CalendarDays, Images } from "lucide-react";
import { useState } from "react";

export type GalleryCategory =
  | "school-activities"
  | "events"
  | "trips";

export type GalleryItem = {
  id: number;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  date: string;
  bgColor: string;
};

interface GalleryCardProps {
  item: GalleryItem;
}

export default function GalleryCard({
  item,
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className="overflow-hidden rounded-[18px] border border-[#DBE7C1] bg-white transition-all duration-200"
      style={{
        transform: isHovered
          ? "translateY(-3px)"
          : "translateY(0)",
        boxShadow: isHovered
          ? "0 8px 32px rgba(25,67,66,0.10)"
          : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Placeholder */}
      <div
        className="relative flex h-[220px] items-center justify-center overflow-hidden"
        style={{
          backgroundColor: item.bgColor,
        }}
      >
        <div className="flex flex-col items-center gap-2 text-[#194342]/40">
          <Images className="h-9 w-9" strokeWidth={1.5} />

          <span className="text-[11px] font-medium">
            تصویر گالری
          </span>
        </div>

        {/* Category */}
        <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-medium text-[#194342]">
          {item.categoryLabel}
        </span>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-[#194342]/65 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#194342]">
            <Images className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[14px] font-bold leading-6 text-[#1F2933]">
          {item.title}
        </h3>

        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[#667085]">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{item.date}</span>
        </div>
      </div>
    </article>
  );
}
