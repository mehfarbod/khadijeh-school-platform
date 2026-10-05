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
import { getCurrentStudentEnrollment } from "@/lib/student-current-grade";

function isTodayBirthday(date: Date | string | null) {
  if (!date) return false;

  const value = new Date(date);
  const today = new Date();

  return (
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
}

export default async function HomePage() {

  const [settings, topStudents, birthdayStudents, manualBirthdays] =
    await Promise.all([
      prisma.schoolSettings.findUnique({
        where: { id: "school-settings" },
        select: {
          showNews: true,
          showEvents: true,
          showBirthdays: true,
          showTopStudents: true,
          showDailyAbsences: true,
          heroTitle: true,
          heroDescription: true,
        },
      }),
      prisma.topStudent.findMany({
        where: { isActive: true },
        orderBy: [
          { academicYear: "desc" },
          { lastName: "asc" },
          { firstName: "asc" },
        ],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: true,
          achievement: true,
        },
      }),
      prisma.student.findMany({
        where: {
          isActive: true,
          isBirthdayVisible: true,
          birthday: { not: null },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthday: true,
          enrollments: {
            where: { academicYear: { isCurrent: true } },
            select: {
              grade: true,
              academicYear: {
                select: { isCurrent: true },
              },
            },
          },
        },
      }),
      prisma.birthday.findMany({
        where: { isVisible: true },
        orderBy: { birthday: "asc" },
        select: {
          id: true,
          firstName: true,
          grade: true,
          birthday: true,
        },
      }),
    ]);


  const visibility = {
    showNews: settings?.showNews ?? true,
    showEvents: settings?.showEvents ?? true,
    showBirthdays: settings?.showBirthdays ?? true,
    showTopStudents: settings?.showTopStudents ?? true,
    showDailyAbsences: settings?.showDailyAbsences ?? true,
  };

  const birthdays = [
    ...birthdayStudents
      .filter((student) => isTodayBirthday(student.birthday))
      .map((student) => {
        const enrollment = getCurrentStudentEnrollment(student.enrollments);

        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: enrollment?.grade ?? "—",
        };
      }),
    ...manualBirthdays
      .filter((item) => isTodayBirthday(item.birthday))
      .map((item) => ({
        id: item.id,
        firstName: item.firstName,
        lastName: "",
        grade: item.grade,
      })),
  ];

  return (
    <PublicLayout>
      <AnnouncementTicker />
      <Hero title={settings?.heroTitle} description={settings?.heroDescription} />

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
          <TopStudents students={topStudents} />
        </Reveal>
      )}

      {visibility.showBirthdays && (
        <Reveal>
          <Birthdays birthdays={birthdays} />
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
