
"use client";

import { cn } from "@/lib/utils";

export type GalleryFilter =
  | "all"
  | "school-activities"
  | "events"
  | "trips";

const filters: {
  value: GalleryFilter;
  label: string;
}[] = [
  {
    value: "all",
    label: "همه تصاویر",
  },
  {
    value: "school-activities",
    label: "فعالیت‌های مدرسه",
  },
  {
    value: "events",
    label: "مراسم و مناسبت‌ها",
  },
  {
    value: "trips",
    label: "اردوها و بازدیدها",
  },
];

interface GalleryFiltersProps {
  activeFilter: GalleryFilter;
  onChange: (value: GalleryFilter) => void;
}

export default function GalleryFilters({
  activeFilter,
  onChange,
}: GalleryFiltersProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 pt-10 sm:px-6">
      <h2 className="mb-4 text-sm font-semibold text-[#194342]">
        دسته‌بندی تصاویر
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={cn(
                "shrink-0 rounded-[10px] px-[22px] py-[9px] text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#194342] text-white"
                  : "border-[1.5px] border-[#DBE7C1] bg-[#FAF8F3] text-[#194342] hover:bg-[#DBE7C1]/30"
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
