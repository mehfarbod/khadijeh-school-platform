"use client";

import {
  Bell,
  CalendarDays,
  Pin,
} from "lucide-react";

import { toPersianNumber } from "@/lib/persian";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export default function AnnouncementCard({
  announcement,
}: AnnouncementCardProps) {
  const formattedDate = toPersianNumber(
    new Date(announcement.createdAt).toLocaleDateString("fa-IR")
  );

  return (
    <article className="rounded-[18px] border border-[#DBE7C1] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(25,67,66,0.08)] sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#DBE7C1]/40 text-[#194342]">
          {announcement.isPinned ? (
            <Pin
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />
          ) : (
            <Bell
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <h2 className="text-[14px] font-bold leading-6 text-[#1F2933] sm:text-[15px]">
              {announcement.title}
            </h2>

            {announcement.isPinned && (
              <span className="rounded-full bg-[#B86F5B]/10 px-2.5 py-1 text-[10px] font-medium text-[#A45F4D]">
                مهم
              </span>
            )}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#667085]">
            <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 font-medium text-[#194342]">
              {announcement.category}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="h-3.5 w-3.5"
                strokeWidth={1.7}
              />

              <span>{formattedDate}</span>
            </span>
          </div>

          <p className="text-[12.5px] leading-[2] text-[#667085] sm:text-[13px]">
            {announcement.content}
          </p>
        </div>
      </div>
    </article>
  );
}