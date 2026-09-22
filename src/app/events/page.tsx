import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import EventsHero from "@/components/events/EventsHero";
import EventsList from "@/components/events/EventsList";

export default function EventsPage() {
  return (
    <>
      <Header />

      <main>
        <EventsHero />
        <EventsList />
      </main>

      <CoursesFooter />
    </>
  );
}