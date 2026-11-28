import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import CourseScheduleListing from "@/components/courses/CourseScheduleListing";

export const dynamic = "force-dynamic";

export default function KonkurCoursesPage() {
  return (
    <>
      <Header />
      <CourseScheduleListing
        title="برنامه کلاس‌های کنکور"
        description="زمان‌بندی و اطلاعات کلاس‌های آمادگی کنکور مدرسه را در این بخش مشاهده کنید."
        keyword="کنکور"
      />
      <CoursesFooter />
    </>
  );
}
