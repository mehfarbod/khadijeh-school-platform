import PublicLayout from "@/components/layout/PublicLayout";
import Hero from "@/components/sections/Hero";
import QuickAccess from "@/components/sections/QuickAccess";
import SchoolIntro from "@/components/sections/SchoolIntro";
import UpcomingEvents from "@/components/sections/UpcomingEvents";
import AnnouncementsPreview from "@/components/sections/AnnouncementsPreview";
import TopStudents from "@/components/sections/TopStudents";
import Birthdays from "@/components/sections/Birthdays";
import CoursesCTA from "@/components/sections/CoursesCTA";
import ContactCTA from "@/components/sections/ContactCTA";

export default function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <QuickAccess />
      <SchoolIntro />
      <UpcomingEvents />
      <AnnouncementsPreview />
      <TopStudents />
      <Birthdays />
      <CoursesCTA />
      <ContactCTA />
    </PublicLayout>
  );
}
