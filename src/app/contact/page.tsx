import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import ContactHero from "@/components/contact/ContactHero";
import ContactMain from "@/components/contact/ContactMain";
import SchoolLocation from "@/components/contact/SchoolLocation";

export default function ContactPage() {
  return (
    <>
      <Header />

      <main>
        <ContactHero />
        <ContactMain />
        <SchoolLocation />
      </main>

      <CoursesFooter />
    </>
  );
}