"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Cake,
  CalendarDays,
  ClipboardPenLine,
  FileText,
  GraduationCap,
  MessageSquare,
  Newspaper,
  Users,
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

interface StatCard {
  label: string;
  value: number | undefined;
  icon: typeof Users;
  href: string;
  iconClass: string;
}

const quickActions = [
  {
    label: "افزودن دانش‌آموز",
    description: "ثبت اطلاعات دانش‌آموز جدید",
    href: "/admin/students",
    icon: Users,
  },
  {
    label: "مدیریت دوره‌ها",
    description: "مشاهده و مدیریت دوره‌ها",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "ثبت‌نام‌های جدید",
    description: "بررسی ثبت‌نام دوره‌ها",
    href: "/admin/registrations",
    icon: ClipboardPenLine,
  },
  {
    label: "پیام‌های رسیده",
    description: "مشاهده پیام‌های تماس",
    href: "/admin/messages",
    icon: MessageSquare,
  },
];

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await fetch("/api/admin/overview", {
          cache: "no-store",
        });

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

  const statCards: StatCard[] = [
    {
      label: "دانش‌آموز فعال",
      value: stats?.studentCount,
      icon: Users,
      href: "/admin/students",
      iconClass: "bg-[#F1F5E8] text-[#194342]",
    },
    {
      label: "کادر مدرسه",
      value: stats?.staffCount,
      icon: GraduationCap,
      href: "/admin/staff",
      iconClass: "bg-[#F8ECE8] text-[#B86F5B]",
    },
    {
      label: "دوره فعال",
      value: stats?.courseCount,
      icon: BookOpen,
      href: "/admin/courses",
      iconClass: "bg-[#F8F2DF] text-[#A8893F]",
    },
    {
      label: "رویداد",
      value: stats?.eventCount,
      icon: CalendarDays,
      href: "/admin/events",
      iconClass: "bg-[#EEF3F5] text-[#536B78]",
    },
    {
      label: "اطلاعیه",
      value: stats?.announcementCount,
      icon: Bell,
      href: "/admin/announcements",
      iconClass: "bg-[#F1F5E8] text-[#194342]",
    },
    {
      label: "پیام جدید",
      value: stats?.unreadMessages,
      icon: MessageSquare,
      href: "/admin/messages",
      iconClass: "bg-[#F8ECE8] text-[#B86F5B]",
    },
    {
      label: "تولد امروز",
      value: stats?.todayBirthdays,
      icon: Cake,
      href: "/admin/birthdays",
      iconClass: "bg-[#F8F2DF] text-[#A8893F]",
    },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px]">
        <section className="mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium text-[#B86F5B]">
                پنل مدیریت مدرسه
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-[#1A2332] sm:text-[28px]">
                داشبورد مدیریت
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#667085]">
                نمای کلی وضعیت مدرسه و دسترسی سریع به بخش‌های مدیریتی
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-[10px] border border-[#E7E2DA] bg-white px-4 text-xs font-medium text-[#667085] transition-colors hover:border-[#D5DECB] hover:bg-[#F1F5E8] hover:text-[#194342]"
            >
              مشاهده سایت
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-[14px] border border-[#E7E2DA] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D5DECB] hover:shadow-[0_8px_25px_rgba(26,35,50,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${card.iconClass}`}
                >
                  <card.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>

                <ArrowLeft className="h-4 w-4 text-[#C5CAD1] opacity-0 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:opacity-100" />
              </div>

              <p className="mt-5 text-[12px] text-[#667085]">{card.label}</p>

              <p className="mt-1 text-[26px] font-bold tracking-tight text-[#1A2332]">
                {card.value === undefined ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-[#F1F0ED]" />
                ) : (
                  card.value
                )}
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[14px] border border-[#E7E2DA] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEEAE3] px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-[#1A2332]">
                  دسترسی سریع
                </h2>
                <p className="mt-1 text-[11px] text-[#98A2B3]">
                  بخش‌هایی که بیشتر استفاده می‌شوند
                </p>
              </div>

              <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-[10px] font-medium text-[#194342]">
                مدیریت
              </span>
            </div>

            <div className="grid gap-px bg-[#EEEAE3] sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group bg-white p-4 transition-colors hover:bg-[#FCFBF9]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#FAF8F5] text-[#194342] transition-colors group-hover:bg-[#F1F5E8]">
                      <action.icon className="h-4 w-4" strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#1A2332]">
                        {action.label}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[#98A2B3]">
                        {action.description}
                      </p>
                    </div>

                    <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#C5CAD1] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#B86F5B]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#E7E2DA] bg-white">
            <div className="border-b border-[#EEEAE3] px-5 py-4">
              <h2 className="text-sm font-bold text-[#1A2332]">
                نیاز به توجه
              </h2>
              <p className="mt-1 text-[11px] text-[#98A2B3]">
                مواردی که بهتر است بررسی شوند
              </p>
            </div>

            <div className="divide-y divide-[#EEEAE3]">
              <AttentionItem
                href="/admin/messages"
                icon={MessageSquare}
                label="پیام‌های خوانده‌نشده"
                value={stats?.unreadMessages}
                emptyText="پیامی برای بررسی وجود ندارد"
                tone="rose"
              />

              <AttentionItem
                href="/admin/birthdays"
                icon={Cake}
                label="تولدهای امروز"
                value={stats?.todayBirthdays}
                emptyText="امروز تولدی ثبت نشده است"
                tone="gold"
              />

              <AttentionItem
                href="/admin/announcements"
                icon={Bell}
                label="اطلاعیه‌های مدرسه"
                value={stats?.announcementCount}
                emptyText="اطلاعیه‌ای ثبت نشده است"
                tone="green"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <DashboardLink
            href="/admin/news"
            icon={Newspaper}
            title="مدیریت اخبار"
            description="اخبار و مطالب منتشرشده مدرسه"
          />

          <DashboardLink
            href="/admin/events"
            icon={CalendarDays}
            title="مدیریت رویدادها"
            description="رویدادها و برنامه‌های پیش‌رو"
          />

          <DashboardLink
            href="/admin/announcements"
            icon={FileText}
            title="مدیریت اطلاعیه‌ها"
            description="اطلاعیه‌های قابل نمایش برای مدرسه"
          />
        </section>
      </div>
    </AdminLayout>
  );
}

function AttentionItem({
  href,
  icon: Icon,
  label,
  value,
  emptyText,
  tone,
}: {
  href: string;
  icon: typeof MessageSquare;
  label: string;
  value: number | undefined;
  emptyText: string;
  tone: "rose" | "gold" | "green";
}) {
  const toneClasses = {
    rose: "bg-[#F8ECE8] text-[#B86F5B]",
    gold: "bg-[#F8F2DF] text-[#A8893F]",
    green: "bg-[#F1F5E8] text-[#194342]",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[#FCFBF9]"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${toneClasses[tone]}`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#1A2332]">{label}</p>

        <p className="mt-1 text-[10px] text-[#98A2B3]">
          {value === undefined ? "در حال دریافت اطلاعات..." : value > 0 ? `${value} مورد برای بررسی` : emptyText}
        </p>
      </div>

      <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#C5CAD1] transition-transform group-hover:-translate-x-0.5 group-hover:text-[#B86F5B]" />
    </Link>
  );
}

function DashboardLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Newspaper;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[14px] border border-[#E7E2DA] bg-white p-4 transition-all duration-200 hover:border-[#D5DECB] hover:bg-[#FCFBF9] hover:shadow-[0_8px_25px_rgba(26,35,50,0.04)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#FAF8F5] text-[#194342] transition-colors group-hover:bg-[#F1F5E8]">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#1A2332]">{title}</p>
        <p className="mt-1 truncate text-[10px] text-[#98A2B3]">
          {description}
        </p>
      </div>

      <ArrowLeft className="h-3.5 w-3.5 text-[#C5CAD1] transition-all group-hover:-translate-x-0.5 group-hover:text-[#B86F5B]" />
    </Link>
  );
}
