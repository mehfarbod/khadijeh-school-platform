"use client";

import CourseCard, { type Course } from "./CourseCard";
import type { FilterTab } from "./CourseFilters";

type ApiCourse = {
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

const gradeBackgroundColors: Record<"10" | "11" | "12", string> = {
  "10": "#194342",
  "11": "#B86F5B",
  "12": "#DBE7C1",
};

function toCourse(course: ApiCourse): Course {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    grade:
      course.gradeLevel === "10"
        ? "پایه دهم"
        : course.gradeLevel === "11"
          ? "پایه یازدهم"
          : course.gradeLevel === "12"
            ? "پایه دوازدهم"
            : "همه پایه‌ها",
    sessions: course.duration || "برنامه آموزشی",
    schedule: course.schedule || "زمان‌بندی متعاقباً اعلام می‌شود",
    capacity: `ظرفیت ${course.capacity} نفر`,
    instructor: course.instructor || "کادر آموزشی مدرسه",
    initials: course.instructor?.trim().charAt(0) || "م",
    status: course.status,
    bgColor:
      gradeBackgroundColors[course.gradeLevel as "10" | "11" | "12"] ||
      "#EEF2F7",
    icon: course.category.includes("زبان")
      ? "language"
      : course.category.includes("هنر")
        ? "art"
        : course.category.includes("پژوه")
          ? "research"
          : course.category.includes("زندگی")
            ? "life"
            : course.category.includes("آزمون")
              ? "exam"
              : "math",
  };
}

interface CoursesGridProps {
  courses: ApiCourse[];
  filter: FilterTab;
}

export default function CoursesGrid({ courses, filter }: CoursesGridProps) {
  const mappedCourses = courses.map(toCourse);
  const filteredCourses =
    filter === "all"
      ? mappedCourses
      : mappedCourses.filter((course) => course.status === filter);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-8">
      {filteredCourses.length === 0 ? (
        <div className="rounded-[14px] border border-[#DBE7C1] bg-white p-12 text-center text-sm text-[#667085]">
          دوره‌ای برای نمایش وجود ندارد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
