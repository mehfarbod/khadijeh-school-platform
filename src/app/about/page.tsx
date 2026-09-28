import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import AboutHero from "@/components/about/AboutHero";
import SchoolIntro from "@/components/about/SchoolIntro";
import { prisma } from "@/lib/prisma";

type AboutStats = { value: string; label: string };
type AboutValue = { title: string; description: string; icon: string };

function parseStats(value: unknown): AboutStats[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is AboutStats =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).value === "string" &&
      typeof (item as Record<string, unknown>).label === "string",
  );
}

function parseValues(value: unknown): AboutValue[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is AboutValue =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).title === "string" &&
      typeof (item as Record<string, unknown>).description === "string" &&
      typeof (item as Record<string, unknown>).icon === "string",
  );
}

export default async function AboutPage() {
  const about = await prisma.aboutPage.findUnique({ where: { id: "school-about" } });

  const aboutData = about
    ? {
        ...about,
        stats: parseStats(about.stats),
        values: parseValues(about.values),
      }
    : null;

  return (
    <>
      <Header />

      <main>
        <AboutHero data={aboutData} />

        <SchoolIntro data={aboutData} />
      </main>

      <CoursesFooter />
    </>
  );
}
