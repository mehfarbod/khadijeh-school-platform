import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CoursesGrid from "@/components/courses/CoursesGrid";
import { prisma } from "@/lib/prisma";

type CourseScheduleListingProps = {
  title: string;
  description: string;
  keyword: string;
};

export default async function CourseScheduleListing({
  title,
  description,
  keyword,
}: CourseScheduleListingProps) {
  const courses = await prisma.course.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { category: { contains: keyword, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      instructor: true,
      schedule: true,
      duration: true,
      capacity: true,
      status: true,
      category: true,
      gradeLevel: true,
    },
  });

  const normalizedCourses = courses.map((course) => ({
    ...course,
    status: course.status === "active" ? "active" as const : "upcoming" as const,
  }));

  return (
    <main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-[1200px]">
        <Link href="/courses" className="inline-flex items-center gap-2 text-xs font-semibold text-[#194342]">
          <ArrowRight className="h-4 w-4" /> بازگشت به دوره‌ها
        </Link>
        <div className="mt-6 rounded-[22px] border border-[#DBE7C1] bg-white px-6 py-8 sm:px-9">
          <h1 className="text-2xl font-bold text-[#194342]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-[#667085]">{description}</p>
        </div>
      </div>
      <CoursesGrid courses={normalizedCourses} filter="all" />
    </main>
  );
}
