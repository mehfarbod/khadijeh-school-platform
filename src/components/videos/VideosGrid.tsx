"use client";

import { useEffect, useMemo, useState } from "react";
import VideoCard, { type Video } from "./VideoCard";
import type { SubjectFilter, VideoFilter } from "./VideoFilters";

export default function VideosGrid({ activeGrade, activeSubject }: { activeGrade: VideoFilter; activeSubject: SubjectFilter }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/videos?activeOnly=true", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredVideos = useMemo(() => videos.filter((video) => {
    const gradeMatch = activeGrade === "all" || video.grade === activeGrade;
    const subjectMatch = activeSubject === "all" || video.subject === activeSubject;
    return gradeMatch && subjectMatch;
  }), [videos, activeGrade, activeSubject]);

  if (loading) {
    return <section className="bg-[#FAF8F3] px-5 pb-14 pt-8 sm:px-6"><div className="mx-auto max-w-[1200px] rounded-[18px] border border-[#DBE7C1] bg-white px-5 py-16 text-center text-sm text-[#667085]">در حال دریافت ویدیوها...</div></section>;
  }

  return (
    <section className="bg-[#FAF8F3] px-5 pb-14 pt-8 sm:px-6 sm:pb-16">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-5"><p className="text-[12px] text-[#667085]">{filteredVideos.length} ویدیو</p></div>
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => <VideoCard key={video.id} video={video} />)}
          </div>
        ) : (
          <div className="rounded-[18px] border border-[#DBE7C1] bg-white px-5 py-16 text-center">
            <p className="text-sm font-medium text-[#194342]">ویدیویی با این فیلترها پیدا نشد.</p>
            <p className="mt-2 text-[12px] text-[#667085]">پایه یا درس دیگری را انتخاب کنید.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function getAvailableSubjects(activeGrade: VideoFilter): SubjectFilter[] {
  // Kept for compatibility with the current page; actual availability is now API-backed.
  const subjects: SubjectFilter[] = ["math", "physics", "chemistry", "literature"];
  return activeGrade === "all" ? subjects : subjects;
}