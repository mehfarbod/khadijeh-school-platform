
"use client";

import { CalendarDays, Images } from "lucide-react";
import { useState } from "react";

export type GalleryCategory =
  | "school-activities"
  | "events"
  | "trips";

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  date: string;
  imageUrl: string;
  description?: string | null;
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
      {/* Image */}
      <div className="relative h-[220px] overflow-hidden">
        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-300" style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }} />
        <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-medium text-[#194342]">{item.categoryLabel}</span>
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
