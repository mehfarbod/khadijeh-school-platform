"use client";

import { useState } from "react";

import Header from "@/components/layout/Header";
import CoursesHero from "@/components/courses/CoursesHero";
import CourseFilters, {
  type FilterTab,
} from "@/components/courses/CourseFilters";
import CoursesGrid from "@/components/courses/CoursesGrid";
import CoursesFooter from "@/components/courses/CoursesFooter";

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  return (
    <>
      <Header />

      <main>
        <CoursesHero />

        <CourseFilters
          activeTab={activeFilter}
          onChange={setActiveFilter}
        />

        <CoursesGrid filter={activeFilter} />
      </main>

      <CoursesFooter />
    </>
  );
}