import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import CourseDetailHero from "@/components/courses/CourseDetailHero";

export default function CourseDetailDemoPage() {
  return (
    <>
      <Header />

      <main>
        <CourseDetailHero
          title="کلاس تقویتی ریاضی"
          description="تقویت مفاهیم پایه و آمادگی برای امتحانات مدرسه"
          status="active"
        />
      </main>

      <CoursesFooter />
    </>
  );
}