"use client";

import { useState } from "react";
import CourseFilters, { type FilterTab } from "./CourseFilters";
import CoursesGrid from "./CoursesGrid";

type CourseData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructor: string | null;
  schedule: string | null;
  duration: string | null;
  capacity: number;
  status: "active" | "upcoming";
  category: string;
  gradeLevel: string | null;
};

export default function CoursesInteractive({
  courses,
}: {
  courses: CourseData[];
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  return (
    <>
      <CourseFilters activeTab={activeFilter} onChange={setActiveFilter} />
      <CoursesGrid courses={courses} filter={activeFilter} />
    </>
  );
}
