import Link from "next/link";
import { ArrowRight, Clock3, Play } from "lucide-react";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

const subjectLabels: Record<string, string> = {
  math: "ریاضی",
  physics: "فیزیک",
  chemistry: "شیمی",
  literature: "ادبیات",
};

const gradeLabels: Record<string, string> = {
  "grade-10": "پایه دهم",
  "grade-11": "پایه یازدهم",
  "grade-12": "پایه دوازدهم",
};

export default async function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = await prisma.educationalVideo.findFirst({
    where: { slug, isActive: true },
  });

  if (!video) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF8F3] px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto w-full max-w-[1000px]">
          <Link href="/videos" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#194342]">
            <ArrowRight className="h-4 w-4" />
            بازگشت به ویدیوهای آموزشی
          </Link>

          <div className="overflow-hidden rounded-[22px] border border-[#DBE7C1] bg-white shadow-[0_12px_40px_rgba(25,67,66,0.08)]">
            <div className="aspect-video bg-[#194342]">
              <video
                className="h-full w-full"
                controls
                preload="metadata"
                src={video.videoUrl}
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                <span className="rounded-full bg-[#DBE7C1]/60 px-3 py-1 text-[#194342]">{subjectLabels[video.subject] ?? video.subject}</span>
                <span>{gradeLabels[video.grade] ?? video.grade}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{video.duration}</span>
                <span>•</span>
                <span>{video.instructor}</span>
              </div>

              <h1 className="mt-4 text-2xl font-bold leading-9 text-[#1F2933]">{video.title}</h1>
            </div>
          </div>
        </div>
      </main>
      <CoursesFooter />
    </>
  );
}