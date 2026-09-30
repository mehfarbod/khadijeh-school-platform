import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import CoursesHero from "@/components/courses/CoursesHero";
import CoursesInteractive from "@/components/courses/CoursesInteractive";
import CoursesFooter from "@/components/courses/CoursesFooter";

export default async function CoursesPage() {
  const queryStart = performance.now();

  const courses = await prisma.course.findMany({
    where: { isActive: true },
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

  console.log(
    `[Courses] Prisma query: ${(performance.now() - queryStart).toFixed(0)}ms`,
  );

  return (
    <>
      <Header />

      <main>
        <CoursesHero />
        <CoursesInteractive courses={courses} />
      </main>

      <CoursesFooter />
    </>
  );
}
