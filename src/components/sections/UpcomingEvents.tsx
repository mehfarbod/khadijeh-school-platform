"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import { formatDateShort, toPersianNumber } from "@/lib/persian";

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

        const today = new Date().toISOString().split("T")[0];

        const upcomingEvents = data
          .filter((event) => event.date >= today)
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
      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-8" />

          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-2">
              رویدادها
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              رویدادهای پیش‌رو
            </h2>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/5 text-center">
                  <span className="text-[10px] font-medium text-primary/70 leading-none">
                    {formatDateShort(event.date).split(" ")[1]}
                  </span>

                  <span className="text-lg font-bold text-primary leading-none mt-0.5">
                    {toPersianNumber(
                      parseInt(event.date.split("-")[2], 10)
                    )}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}