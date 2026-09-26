"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, ArrowLeft } from "lucide-react";

import { formatDateShort, toPersianNumber } from "@/lib/persian";
import { isUpcomingEventDate } from "@/lib/event-date";

interface EventItem {
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

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await fetch("/api/events?activeOnly=true");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data: EventItem[] = await response.json();

        const upcomingEvents = data
          .filter((event) => isUpcomingEventDate(event.date))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 4);

        if (!cancelled) {
          setEvents(upcomingEvents);
        }
      } catch (error) {
        console.error("Failed to load upcoming events:", error);

        if (!cancelled) {
          setEvents([]);
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
      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />

          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose">
              رویدادها
            </p>

            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              رویدادهای پیش‌رو
            </h2>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <article className="h-full rounded-xl border border-border/60 bg-card p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-border group-hover:shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/5 text-center">
                    <span className="text-[10px] font-medium leading-none text-primary/70">
                      {formatDateShort(event.date).split(" ")[1]}
                    </span>

                    <span className="mt-0.5 text-lg font-bold leading-none text-primary">
                      {toPersianNumber(
                        parseInt(event.date.split("-")[2], 10).toString(),
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {event.title}
                    </h3>

                    <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {event.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                      )}

                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
