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
import AnnouncementTicker from "@/components/sections/AnnouncementTicker";
import LatestNews from "@/components/sections/LatestNews";
import ContactSection from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <PublicLayout>
      <AnnouncementTicker />
      <Hero />
      <QuickAccess />
       <TopStudents />
      <Birthdays />
      <LatestNews />
      {/* <SchoolIntro /> */}
      <UpcomingEvents />
      <ContactSection />
      <AnnouncementsPreview />
    
      <CoursesCTA />
      <ContactCTA />
    </PublicLayout>
  );
}
