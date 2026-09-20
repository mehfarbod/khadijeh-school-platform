"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Bell,
  Newspaper,
  Cake,
} from "lucide-react";

interface OverviewStats {
  studentCount: number;
  staffCount: number;
  courseCount: number;
  eventCount: number;
  announcementCount: number;
  unreadMessages: number;
  todayBirthdays: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await fetch("/api/admin/overview");

        if (!response.ok) {
          throw new Error("خطا در دریافت اطلاعات داشبورد");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to load overview:", error);
      }
    };

    loadOverview();
  }, []);

  const cards = [
    {
      label: "دانش‌آموز فعال",
      value: stats?.studentCount,
      icon: Users,
      color: "bg-primary/5 text-primary",
    },
    {
      label: "کادر مدرسه",
      value: stats?.staffCount,
      icon: GraduationCap,
      color: "bg-rose/10 text-rose",
    },
    {
      label: "دوره فعال",
      value: stats?.courseCount,
      icon: BookOpen,
      color: "bg-gold/10 text-gold",
    },
    {
      label: "رویداد",
      value: stats?.eventCount,
      icon: Calendar,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "اعلامیه",
      value: stats?.announcementCount,
      icon: Bell,
      color: "bg-navy/10 text-navy",
    },
    {
      label: "پیام جدید",
      value: stats?.unreadMessages,
      icon: Newspaper,
      color: "bg-primary/5 text-primary",
    },
    {
      label: "تولد امروز",
      value: stats?.todayBirthdays,
      icon: Cake,
      color: "bg-rose/10 text-rose",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          داشبورد
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          خلاصه وضعیت مدرسه
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}
              >
                <card.icon className="h-4 w-4" />
              </div>

              <p className="text-xs text-muted-foreground">
                {card.label}
              </p>
            </div>

            <p className="text-2xl font-bold text-foreground">
              {card.value === undefined ? (
                <span className="inline-block h-7 w-12 bg-muted rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}