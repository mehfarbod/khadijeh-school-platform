import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import CourseScheduleListing from "@/components/courses/CourseScheduleListing";

export const dynamic = "force-dynamic";

export default function RemedialCoursesPage() {
  return (
    <>
      <Header />
      <CourseScheduleListing
        title="برنامه کلاس‌های تقویتی"
        description="زمان‌بندی و اطلاعات کلاس‌های تقویتی فعال مدرسه را در این بخش مشاهده کنید."
        keyword="تقویتی"
      />
      <CoursesFooter />
    </>
  );
}
