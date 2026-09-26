
"use client";

import { useEffect, useState } from "react";
import GalleryCard, {
  type GalleryCategory,
  type GalleryItem,
} from "./GalleryCard";
import type { GalleryFilter } from "./GalleryFilters";

const galleryItems: GalleryItem[] = [];

interface GalleryGridProps {
  activeFilter: GalleryFilter;
}

export default function GalleryGrid({
  activeFilter,
}: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/gallery").then(r => r.json()).then(data => setItems(Array.isArray(data) ? data : [])).finally(() => setLoading(false)); }, []);
  const filteredItems = activeFilter === "all" ? items : items.filter(item => item.category === activeFilter);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-6 sm:py-12">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[12px] text-[#667085]">
          {filteredItems.length} تصویر
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-[#667085]">در حال دریافت تصاویر...</div>
      ) : filteredItems.length > 0 ? (
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
