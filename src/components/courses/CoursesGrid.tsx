import CourseCard, { type Course } from "./CourseCard";
import type { FilterTab } from "./CourseFilters";

const courses: Course[] = [
  {
    id: 1,
    title: "کلاس تقویتی ریاضی",
    description: "تقویت مفاهیم پایه و آمادگی برای امتحانات مدرسه",
    grade: "پایه دهم",
    sessions: "۱۲ جلسه",
    schedule: "شنبه‌ها، ساعت ۱۶",
    capacity: "ظرفیت ۲۰ نفر",
    instructor: "خانم احمدی",
    initials: "ا",
    status: "active",
    bgColor: "#DBE7C1",
    icon: "math",
  },
  {
    id: 2,
    title: "کارگاه مهارت‌های زندگی",
    description: "آموزش مهارت‌های اجتماعی، تصمیم‌گیری و خودشناسی",
    grade: "پایه‌های دهم و یازدهم",
    sessions: "۸ جلسه",
    schedule: "دوشنبه‌ها، ساعت ۱۵",
    capacity: "ظرفیت ۲۵ نفر",
    instructor: "خانم رضایی",
    initials: "ر",
    status: "active",
    bgColor: "#BFD7EA",
    icon: "life",
  },
  {
    id: 3,
    title: "آمادگی آزمون‌های نهایی",
    description: "مرور جامع مباحث و تمرین آزمون‌های استاندارد",
    grade: "پایه دوازدهم",
    sessions: "۱۶ جلسه",
    schedule: "یکشنبه‌ها، ساعت ۱۴",
    capacity: "ظرفیت ۱۸ نفر",
    instructor: "خانم موسوی",
    initials: "م",
    status: "active",
    bgColor: "#EEF2F7",
    icon: "exam",
  },
  {
    id: 4,
    title: "کارگاه پژوهش و المپیاد",
    description: "آشنایی با روش تحقیق علمی و آمادگی برای المپیادهای علمی",
    grade: "پایه‌های دهم تا دوازدهم",
    sessions: "۱۰ جلسه",
    schedule: "چهارشنبه‌ها، ساعت ۱۵",
    capacity: "ظرفیت ۱۵ نفر",
    instructor: "خانم کریمی",
    initials: "ک",
    status: "upcoming",
    bgColor: "#DBE7C1",
    icon: "research",
  },
  {
    id: 5,
    title: "کارگاه هنر و خلاقیت",
    description: "کشف استعداد‌های هنری و پرورش خلاقیت در فضایی آزاد",
    grade: "پایه‌های دهم و یازدهم",
    sessions: "۱۰ جلسه",
    schedule: "سه‌شنبه‌ها، ساعت ۱۶",
    capacity: "ظرفیت ۲۰ نفر",
    instructor: "خانم صادقی",
    initials: "ص",
    status: "upcoming",
    bgColor: "#EEF2F7",
    icon: "art",
  },
  {
    id: 6,
    title: "دوره زبان انگلیسی",
    description: "تقویت مهارت‌های گفتاری، نوشتاری و درک مطلب زبان انگلیسی",
    grade: "پایه‌های دهم تا دوازدهم",
    sessions: "۱۴ جلسه",
    schedule: "پنجشنبه‌ها، ساعت ۱۳",
    capacity: "ظرفیت ۲۲ نفر",
    instructor: "خانم نجفی",
    initials: "ن",
    status: "active",
    bgColor: "#BFD7EA",
    icon: "language",
  },
];

interface CoursesGridProps {
  filter: FilterTab;
}

export default function CoursesGrid({ filter }: CoursesGridProps) {
  const filteredCourses =
    filter === "all"
      ? courses
      : courses.filter((course) => course.status === filter);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}