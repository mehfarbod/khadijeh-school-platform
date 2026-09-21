import Header from "@/components/layout/Header";
import ProgramsHero from "@/components/programs/ProgramsHero";
import ProgramsGrid from "@/components/programs/ProgramsGrid";
import CoursesFooter from "@/components/courses/CoursesFooter";

export default function ProgramsPage() {
  return (
    <>
      <Header />

      <main>
        <ProgramsHero />
        <ProgramsGrid />
      </main>

      <CoursesFooter />
    </>
  );
}