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
  status: string;
  category: string;
  gradeLevel: string | null;
};

export default function CoursesInteractive({
  courses,
}: {
  courses: CourseData[];
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const normalizedCourses = courses.map((course) => ({
    ...course,
    status: course.status === "active" ? "active" as const : "upcoming" as const,
  }));

  return (
    <>
      <CourseFilters activeTab={activeFilter} onChange={setActiveFilter} />
      <CoursesGrid courses={normalizedCourses} filter={activeFilter} />
    </>
  );
}
