import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import AboutHero from "@/components/about/AboutHero";
import SchoolIntro from "@/components/about/SchoolIntro";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main>
        <AboutHero />

        <SchoolIntro />
      </main>

      <CoursesFooter />
    </>
  );
}