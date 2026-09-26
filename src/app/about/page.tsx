import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import AboutHero from "@/components/about/AboutHero";
import SchoolIntro from "@/components/about/SchoolIntro";
import { prisma } from "@/lib/prisma";

export default async function AboutPage() {
  const about = await prisma.aboutPage.findUnique({ where: { id: "school-about" } });
  return (
    <>
      <Header />

      <main>
        <AboutHero data={about} />

        <SchoolIntro data={about} />
      </main>

      <CoursesFooter />
    </>
  );
}