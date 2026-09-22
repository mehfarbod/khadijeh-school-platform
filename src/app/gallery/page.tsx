"use client";

import { Suspense, useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryFilters, {
  type GalleryFilter,
} from "@/components/gallery/GalleryFilters";
import GalleryGrid from "@/components/gallery/GalleryGrid";

function GalleryPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryFromUrl =
    searchParams?.get("category");

  const initialFilter: GalleryFilter =
    categoryFromUrl === "school-activities" ||
    categoryFromUrl === "events" ||
    categoryFromUrl === "trips"
      ? categoryFromUrl
      : "all";

  const [activeFilter, setActiveFilter] =
    useState<GalleryFilter>(initialFilter);

  useEffect(() => {
    const urlCategory =
      searchParams?.get("category");

    const normalizedUrlCategory: GalleryFilter =
      urlCategory === "school-activities" ||
      urlCategory === "events" ||
      urlCategory === "trips"
        ? urlCategory
        : "all";

    if (normalizedUrlCategory !== activeFilter) {
      setActiveFilter(normalizedUrlCategory);
    }
  }, [searchParams, activeFilter]);

  function handleFilterChange(value: GalleryFilter) {
    setActiveFilter(value);

    const params = new URLSearchParams(
      searchParams?.toString() ?? ""
    );

    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    const queryString = params.toString();

    if (!pathname) {
      return;
    }

    router.replace(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
      {
        scroll: false,
      }
    );
  }

  return (
    <>
      <Header />

      <main className="bg-[#FAF8F3]">
        <GalleryHero />

        <GalleryFilters
          activeFilter={activeFilter}
          onChange={handleFilterChange}
        />

        <GalleryGrid
          activeFilter={activeFilter}
        />
      </main>

      <CoursesFooter />
    </>
  );
}

function GalleryPageFallback() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        <section className="flex min-h-[500px] items-center justify-center px-5">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#DBE7C1]" />
        </section>
      </main>

      <CoursesFooter />
    </>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryPageFallback />}>
      <GalleryPageContent />
    </Suspense>
  );
}