"use client";

import { useEffect, useState } from "react";

import EventCard, {
  type EventItem,
} from "@/components/events/EventCard";
import { isUpcomingEventDate } from "@/lib/event-date";

export default function EventsList() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        setError(false);

        const response = await fetch(
          "/api/events?activeOnly=true",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data: EventItem[] = await response.json();

        const upcomingEvents = data
          .filter((event) => isUpcomingEventDate(event.date))
          .sort((a, b) => a.date.localeCompare(b.date));

        if (!cancelled) {
          setEvents(upcomingEvents);
        }
      } catch (error) {
        console.error("Failed to load events:", error);

        if (!cancelled) {
          setEvents([]);
          setError(true);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!events) {
    return (
      <section className="bg-[#FAF8F3] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl bg-[#E9EDE1]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-lg font-bold text-[#1F2933]">
            دریافت رویدادها با مشکل مواجه شد
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#667085]">
            لطفاً کمی بعد دوباره تلاش کنید.
          </p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5E8]">
            <span className="text-xl text-[#194342]">○</span>
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#1F2933]">
            در حال حاضر رویدادی ثبت نشده است
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#667085]">
            به‌محض ثبت رویداد جدید، اطلاعات آن در این بخش نمایش داده می‌شود.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAF8F3] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wider text-[#B86F5B]">
            برنامه‌های مدرسه
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#1F2933] sm:text-2xl">
            رویدادهای پیش‌رو
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
            رویدادها و برنامه‌های آینده مدرسه را از اینجا دنبال کنید.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>
      </div>
    </section>
  );
}