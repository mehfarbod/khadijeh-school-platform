"use client";

import { useEffect, useState } from "react";
import CourseCard, { type Course } from "./CourseCard";
import type { FilterTab } from "./CourseFilters";

export default function CoursesGrid({ filter }: { filter: FilterTab }) {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    fetch("/api/courses", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "خطا");
        return data;
      })
      .then(setCourses)
      .catch((e) => { console.error(e); setCourses([]); });
  }, []);

  const filtered = courses?.filter((course) => filter === "all" || course.status === filter) ?? [];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-8">
      {courses === null ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-[420px] animate-pulse rounded-[18px] bg-[#EEF2F7]"/>)}</div> :
      filtered.length === 0 ? <div className="rounded-[18px] border border-[#DBE7C1] bg-white py-16 text-center text-sm text-[#667085]">در این بخش دوره‌ای وجود ندارد.</div> :
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(course => <CourseCard key={course.id} course={course}/>)}</div>}
    </section>
  );
}
