"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import VideosHero from "@/components/videos/VideosHero";
import VideoFilters, {
  type SubjectFilter,
  type VideoFilter,
} from "@/components/videos/VideoFilters";
import VideosGrid, {
  getAvailableSubjects,
} from "@/components/videos/VideosGrid";

function VideosPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const gradeFromUrl = searchParams?.get("grade");

  const initialGrade: VideoFilter =
    gradeFromUrl === "grade-10" ||
    gradeFromUrl === "grade-11" ||
    gradeFromUrl === "grade-12"
      ? gradeFromUrl
      : "all";

  const [activeGrade, setActiveGrade] = useState<VideoFilter>(initialGrade);

  const [activeSubject, setActiveSubject] = useState<SubjectFilter>("all");

  const availableSubjects = getAvailableSubjects(activeGrade);

  useEffect(() => {
    if (activeSubject !== "all" && !availableSubjects.includes(activeSubject)) {
      setActiveSubject("all");
    }
  }, [activeGrade, activeSubject, availableSubjects]);

  useEffect(() => {
    const urlGrade = searchParams?.get("grade");

    const normalizedUrlGrade =
      urlGrade === "grade-10" ||
      urlGrade === "grade-11" ||
      urlGrade === "grade-12"
        ? urlGrade
        : "all";

    if (normalizedUrlGrade !== activeGrade) {
      setActiveGrade(normalizedUrlGrade);
      setActiveSubject("all");
    }
  }, [searchParams, activeGrade]);

  function handleGradeChange(value: VideoFilter) {
    setActiveGrade(value);
    setActiveSubject("all");

    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (value === "all") {
      params.delete("grade");
    } else {
      params.set("grade", value);
    }

    const queryString = params.toString();

    if (!pathname) {
      return;
    }

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  return (
    <>
      <Header />

      <main className="bg-[#FAF8F3]">
        <VideosHero />

        <VideoFilters
          activeGrade={activeGrade}
          activeSubject={activeSubject}
          availableSubjects={availableSubjects}
          onGradeChange={handleGradeChange}
          onSubjectChange={setActiveSubject}
        />

        <VideosGrid activeGrade={activeGrade} activeSubject={activeSubject} />
      </main>

      <CoursesFooter />
    </>
  );
}

function VideosPageFallback() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        <section className="flex min-h-[500px] items-center justify-center px-5">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#DBE7C1]" />
        </section>
      </main>

      <CoursesFooter />
    </>
  );
}

export default function VideosPage() {
  return (
    <Suspense fallback={<VideosPageFallback />}>
      <VideosPageContent />
    </Suspense>
  );
}
