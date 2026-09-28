import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/layout/PublicLayout";
import Hero from "@/components/sections/Hero";
import QuickAccess from "@/components/sections/QuickAccess";
import UpcomingEvents from "@/components/sections/UpcomingEvents";
import AnnouncementsPreview from "@/components/sections/AnnouncementsPreview";
import TopStudents from "@/components/sections/TopStudents";
import Birthdays from "@/components/sections/Birthdays";
import DailyAbsences from "@/components/sections/DailyAbsences";
import CoursesCTA from "@/components/sections/CoursesCTA";
import ContactCTA from "@/components/sections/ContactCTA";
import AnnouncementTicker from "@/components/sections/AnnouncementTicker";
import LatestNews from "@/components/sections/LatestNews";
import ContactSection from "@/components/sections/ContactSection";
import Reveal from "@/components/ui/Reveal";

export default async function HomePage() {
  const settings = await prisma.schoolSettings.findUnique({
    where: { id: "school-settings" },
    select: {
      showNews: true,
      showEvents: true,
      showBirthdays: true,
      showTopStudents: true,
      showDailyAbsences: true,
    },
  });

  const visibility = {
    showNews: settings?.showNews ?? true,
    showEvents: settings?.showEvents ?? true,
    showBirthdays: settings?.showBirthdays ?? true,
    showTopStudents: settings?.showTopStudents ?? true,
    showDailyAbsences: settings?.showDailyAbsences ?? true,
  };

  return (
    <PublicLayout>
      <AnnouncementTicker />
      <Hero />

      <Reveal>
        <QuickAccess />
      </Reveal>

      <Reveal>
        <CoursesCTA />
      </Reveal>

      {visibility.showEvents && (
        <Reveal>
          <UpcomingEvents />
        </Reveal>
      )}

      <Reveal>
        <AnnouncementsPreview />
      </Reveal>

      {visibility.showTopStudents && (
        <Reveal>
          <TopStudents />
        </Reveal>
      )}

      {visibility.showBirthdays && (
        <Reveal>
          <Birthdays />
        </Reveal>
      )}

      {visibility.showDailyAbsences && (
        <Reveal>
          <DailyAbsences />
        </Reveal>
      )}

      {visibility.showNews && (
        <Reveal>
          <LatestNews />
        </Reveal>
      )}

      <Reveal>
        <ContactSection />
      </Reveal>

      <ContactCTA />
    </PublicLayout>
  );
}
