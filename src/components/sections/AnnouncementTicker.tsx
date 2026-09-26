"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
};

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/announcements?activeOnly=true&tickerOnly=true", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load announcements");
        return response.json();
      })
      .then((data: Announcement[]) => {
        if (!cancelled) setAnnouncements(data);
      })
      .catch(() => {
        if (!cancelled) setAnnouncements([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (announcements.length === 0) return null;

  return (
    <section
      aria-label="اطلاعیه‌های مهم"
      className="w-full overflow-hidden bg-[#153A39] text-white"
    >
      <div className="mx-auto flex h-10 max-w-[1440px] items-center px-4 lg:px-6">
        <div className="shrink-0 border-l border-white/15 pl-4">
          <span className="whitespace-nowrap text-xs font-semibold text-white">
            اطلاعیه‌های مهم
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-16 pr-8">
            {[...announcements, ...announcements].map((announcement, index) => (
              <Link
                key={`${announcement.id}-${index}`}
                href="/announcements"
                className="whitespace-nowrap text-xs text-white/80 transition-colors hover:text-white"
                aria-label={`مشاهده اطلاعیه: ${announcement.title}`}
              >
                ⬥ {announcement.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker 24s linear infinite;
        }

        @keyframes ticker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(50%);
          }
        }
      `}</style>
    </section>
  );
}
