"use client";

import { useEffect, useState } from "react";

import AnnouncementCard, {
  type Announcement,
} from "@/components/announcements/AnnouncementCard";

function AnnouncementSkeleton() {
  return (
    <div className="rounded-[18px] border border-[#DBE7C1] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-[12px] bg-[#F1F5E8]" />

        <div className="min-w-0 flex-1">
          <div className="h-5 w-2/3 animate-pulse rounded bg-[#F1F5E8]" />

          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-[#F1F5E8]" />

          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-[#F1F5E8]" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-[#F1F5E8]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<
    Announcement[] | null
  >(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      try {
        setError(false);

        const response = await fetch("/api/announcements");

        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const data: Announcement[] = await response.json();

        if (isMounted) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error(
          "Failed to load announcements:",
          error
        );

        if (isMounted) {
          setError(true);
          setAnnouncements([]);
        }
      }
    }

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-[1000px] px-5 py-10 sm:px-6 sm:py-12 lg:py-14">
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold text-[#B86F5B]">
          پیام‌های مدرسه
        </p>

        <h2 className="text-xl font-bold text-[#194342] sm:text-2xl">
          آخرین اطلاعیه‌ها
        </h2>
      </div>

      {announcements === null && (
        <div className="space-y-3">
          <AnnouncementSkeleton />
          <AnnouncementSkeleton />
          <AnnouncementSkeleton />
        </div>
      )}

      {announcements !== null &&
        !error &&
        announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        )}

      {announcements !== null &&
        !error &&
        announcements.length === 0 && (
          <div className="rounded-[18px] border border-[#DBE7C1] bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5E8] text-[#194342]">
              <span className="text-lg">✓</span>
            </div>

            <h3 className="text-[14px] font-bold text-[#194342]">
              اطلاعیه‌ای وجود ندارد
            </h3>

            <p className="mx-auto mt-2 max-w-[420px] text-[12px] leading-7 text-[#667085]">
              در حال حاضر اطلاعیه فعالی برای نمایش وجود ندارد.
            </p>
          </div>
        )}

      {error && (
        <div className="rounded-[18px] border border-[#E8C8C0] bg-white px-6 py-12 text-center">
          <h3 className="text-[14px] font-bold text-[#A45F4D]">
            دریافت اطلاعیه‌ها با مشکل مواجه شد
          </h3>

          <p className="mx-auto mt-2 max-w-[420px] text-[12px] leading-7 text-[#667085]">
            لطفاً چند لحظه بعد دوباره تلاش کنید.
          </p>
        </div>
      )}
    </section>
  );
}