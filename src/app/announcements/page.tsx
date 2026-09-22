import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import AnnouncementsHero from "@/components/announcements/AnnouncementsHero";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";

export default function AnnouncementsPage() {
  return (
    <>
      <Header />

      <main className="bg-[#FAF8F3]">
        <AnnouncementsHero />
        <AnnouncementsList />
      </main>

      <CoursesFooter />
    </>
  );
}