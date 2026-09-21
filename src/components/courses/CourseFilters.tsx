"use client";

import { cn } from "@/lib/utils";

export type FilterTab = "all" | "active" | "upcoming";

const tabs: { value: FilterTab; label: string }[] = [
  {
    value: "all",
    label: "همه دوره‌ها",
  },
  {
    value: "active",
    label: "در حال ثبت‌نام",
  },
  {
    value: "upcoming",
    label: "دوره‌های آینده",
  },
];

interface CourseFiltersProps {
  activeTab: FilterTab;
  onChange: (value: FilterTab) => void;
}

export default function CourseFilters({
  activeTab,
  onChange,
}: CourseFiltersProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-10">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#194342]">
          دسته‌بندی دوره‌ها
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "shrink-0 rounded-[10px] px-[22px] py-[9px] text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#194342] text-white"
                  : "border-[1.5px] border-[#DBE7C1] bg-[#FAF8F3] text-[#194342] hover:bg-[#DBE7C1]/30"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}