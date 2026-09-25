import { useEffect, useState } from "react";
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

const backgroundColors = ["#DBE7C1", "#BFD7EA", "#EEF2F7"];

function toCourse(course: ApiCourse, index: number): Course {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    grade: course.gradeLevel || "همه پایه‌ها",
    sessions: course.duration || "برنامه آموزشی",
    schedule: course.schedule || "زمان‌بندی متعاقباً اعلام می‌شود",
    capacity: `ظرفیت ${course.capacity} نفر`,
    instructor: course.instructor || "کادر آموزشی مدرسه",
    initials: course.instructor?.trim().charAt(0) || "م",
    status: course.status,
    bgColor: backgroundColors[index % backgroundColors.length],
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
  filter: FilterTab;
}

export default function CoursesGrid({ filter }: CoursesGridProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch("/api/courses?activeOnly=false", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "خطا در دریافت دوره‌ها.");
        if (!cancelled) setCourses((data as ApiCourse[]).map(toCourse));
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "خطا در دریافت دوره‌ها.");
          setCourses([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadCourses();
    return () => { cancelled = true; };
  }, []);

  const filteredCourses = filter === "all" ? courses : courses.filter((course) => course.status === filter);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-8">
      {isLoading ? (
        <div className="py-16 text-center text-sm text-[#667085]">در حال دریافت دوره‌ها...</div>
      ) : error ? (
        <div className="rounded-[14px] border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-[14px] border border-[#DBE7C1] bg-white p-12 text-center text-sm text-[#667085]">دوره‌ای برای نمایش وجود ندارد.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      )}
    </section>
  );
}