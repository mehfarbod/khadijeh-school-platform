"use client";

import VideoCard, { type Video } from "./VideoCard";
import type {
  SubjectFilter,
  VideoFilter,
} from "./VideoFilters";

const videos: Video[] = [
  {
    id: 1,
    title: "حل معادلات درجه دوم",
    subject: "math",
    grade: "grade-10",
    gradeLabel: "پایه دهم",
    duration: "۱۸ دقیقه",
    instructor: "خانم احمدی",
    bgColor: "#DBE7C1",
  },
  {
    id: 2,
    title: "آشنایی با ساختار اتم",
    subject: "chemistry",
    grade: "grade-10",
    gradeLabel: "پایه دهم",
    duration: "۲۴ دقیقه",
    instructor: "خانم موسوی",
    bgColor: "#BFD7EA",
  },
  {
    id: 3,
    title: "آرایه‌های ادبی؛ تشبیه و استعاره",
    subject: "literature",
    grade: "grade-11",
    gradeLabel: "پایه یازدهم",
    duration: "۲۱ دقیقه",
    instructor: "خانم رضایی",
    bgColor: "#EEF2F7",
  },
  {
    id: 4,
    title: "مشتق و کاربردهای آن",
    subject: "math",
    grade: "grade-11",
    gradeLabel: "پایه یازدهم",
    duration: "۲۸ دقیقه",
    instructor: "خانم احمدی",
    bgColor: "#DBE7C1",
  },
  {
    id: 5,
    title: "مرور نکات مهم فیزیک",
    subject: "physics",
    grade: "grade-12",
    gradeLabel: "پایه دوازدهم",
    duration: "۳۲ دقیقه",
    instructor: "خانم کریمی",
    bgColor: "#BFD7EA",
  },
  {
    id: 6,
    title: "آمادگی آزمون نهایی فارسی",
    subject: "literature",
    grade: "grade-12",
    gradeLabel: "پایه دوازدهم",
    duration: "۲۶ دقیقه",
    instructor: "خانم رضایی",
    bgColor: "#EEF2F7",
  },
];

interface VideosGridProps {
  activeGrade: VideoFilter;
  activeSubject: SubjectFilter;
}

export default function VideosGrid({
  activeGrade,
  activeSubject,
}: VideosGridProps) {
  const filteredVideos = videos.filter((video) => {
    const gradeMatch =
      activeGrade === "all" ||
      video.grade === activeGrade;

    const subjectMatch =
      activeSubject === "all" ||
      video.subject === activeSubject;

    return gradeMatch && subjectMatch;
  });

  return (
    <section className="bg-[#FAF8F3] px-5 pb-14 pt-8 sm:px-6 sm:pb-16">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[12px] text-[#667085]">
            {filteredVideos.length} ویدیو
          </p>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-[#DBE7C1] bg-white px-5 py-16 text-center">
            <p className="text-sm font-medium text-[#194342]">
              ویدیویی با این فیلترها پیدا نشد.
            </p>

            <p className="mt-2 text-[12px] text-[#667085]">
              پایه یا درس دیگری را انتخاب کنید.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/*
 * این تابع برای پیدا کردن درس‌های موجود در پایه انتخاب‌شده استفاده می‌شود.
 */
export function getAvailableSubjects(
  activeGrade: VideoFilter
): SubjectFilter[] {
  const subjects = new Set<SubjectFilter>();

  videos.forEach((video) => {
    if (
      activeGrade === "all" ||
      video.grade === activeGrade
    ) {
      subjects.add(video.subject);
    }
  });

  return Array.from(subjects);
}