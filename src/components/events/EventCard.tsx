"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { formatJalaliDateShort, toPersianNumber } from "@/lib/persian";

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string | null;
  location: string | null;
  eventType: string;
  coverImage: string | null;
  isActive: boolean;
}

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const formattedDate = formatJalaliDateShort(event.date);

  const day = event.date.replaceAll("-", "/").split("/")[2]
    ? toPersianNumber(
        String(parseInt(event.date.replaceAll("-", "/").split("/")[2], 10))
      )
    : "";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#194342]/40"
    >
      <article className="h-full overflow-hidden rounded-2xl border border-[#E1E8D6] bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#194342]/20 group-hover:shadow-[0_12px_30px_rgba(25,67,66,0.08)]">
        {event.coverImage && (
          <div className="aspect-[16/7] overflow-hidden bg-[#F1F5E8]">
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F1F5E8] text-center">
              <span className="text-[10px] font-medium text-[#667085]">
                {formattedDate.split(" ")[1] ?? ""}
              </span>

              <span className="mt-0.5 text-xl font-bold leading-none text-[#194342]">
                {day}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2">
                <span className="inline-flex rounded-full bg-[#DBE7C1] px-2.5 py-1 text-[10px] font-semibold text-[#194342]">
                  {event.eventType}
                </span>
              </div>

              <h2 className="text-base font-bold leading-7 text-[#1F2933] transition-colors group-hover:text-[#194342] sm:text-lg">
                {event.title}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#667085]">
                {event.description}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E1E8D6] pt-4 text-xs text-[#667085]">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#B86F5B]" />
              {formattedDate}
            </span>

            {event.time && (
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-[#B86F5B]" />
                {event.time}
              </span>
            )}

            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#B86F5B]" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}