
"use client";

import GalleryCard, {
  type GalleryCategory,
  type GalleryItem,
} from "./GalleryCard";
import type { GalleryFilter } from "./GalleryFilters";

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "فعالیت‌های علمی دانش‌آموزان",
    category: "school-activities",
    categoryLabel: "فعالیت‌های مدرسه",
    date: "۱۵ شهریور ۱۴۰۵",
    bgColor: "#DBE7C1",
  },
  {
    id: 2,
    title: "جشن آغاز سال تحصیلی",
    category: "events",
    categoryLabel: "مراسم و مناسبت‌ها",
    date: "۱۰ شهریور ۱۴۰۵",
    bgColor: "#BFD7EA",
  },
  {
    id: 3,
    title: "کارگاه مهارت‌های زندگی",
    category: "school-activities",
    categoryLabel: "فعالیت‌های مدرسه",
    date: "۸ شهریور ۱۴۰۵",
    bgColor: "#EEF2F7",
  },
  {
    id: 4,
    title: "اردوی فرهنگی دانش‌آموزان",
    category: "trips",
    categoryLabel: "اردوها و بازدیدها",
    date: "۲ شهریور ۱۴۰۵",
    bgColor: "#DBE7C1",
  },
  {
    id: 5,
    title: "مراسم بزرگداشت معلمان",
    category: "events",
    categoryLabel: "مراسم و مناسبت‌ها",
    date: "۲۸ مرداد ۱۴۰۵",
    bgColor: "#BFD7EA",
  },
  {
    id: 6,
    title: "نمایشگاه دستاوردهای دانش‌آموزی",
    category: "school-activities",
    categoryLabel: "فعالیت‌های مدرسه",
    date: "۲۵ مرداد ۱۴۰۵",
    bgColor: "#EEF2F7",
  },
  {
    id: 7,
    title: "بازدید علمی از مرکز پژوهشی",
    category: "trips",
    categoryLabel: "اردوها و بازدیدها",
    date: "۲۰ مرداد ۱۴۰۵",
    bgColor: "#BFD7EA",
  },
  {
    id: 8,
    title: "مراسم فرهنگی مدرسه",
    category: "events",
    categoryLabel: "مراسم و مناسبت‌ها",
    date: "۱۸ مرداد ۱۴۰۵",
    bgColor: "#DBE7C1",
  },
];

export function getGalleryItems(
  activeFilter: GalleryFilter
) {
  if (activeFilter === "all") {
    return galleryItems;
  }

  return galleryItems.filter(
    (item) => item.category === activeFilter
  );
}

interface GalleryGridProps {
  activeFilter: GalleryFilter;
}

export default function GalleryGrid({
  activeFilter,
}: GalleryGridProps) {
  const filteredItems =
    getGalleryItems(activeFilter);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[12px] text-[#667085]">
          {filteredItems.length} تصویر
        </p>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center rounded-[18px] border border-dashed border-[#DBE7C1] bg-white">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#194342]">
              تصویری در این دسته وجود ندارد
            </p>

            <p className="mt-2 text-xs text-[#667085]">
              تصاویر این بخش به‌زودی اضافه می‌شوند.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
