"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Newspaper,
  CalendarDays,
  Bell,
  Trophy,
  Cake,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  ClipboardPenLine,
  PlaySquare,
  FileText,
  Settings,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface SidebarGroup {
  label?: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    items: [
      {
        label: "داشبورد",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "مدیریت مدرسه",
    items: [
      {
        label: "دانش‌آموزان",
        href: "/admin/students",
        icon: Users,
      },
      {
        label: "کادر مدرسه",
        href: "/admin/staff",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "دوره‌ها و ثبت‌نام",
    items: [
      {
        label: "دوره‌ها",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        label: "ثبت‌نام دوره‌ها",
        href: "/admin/registrations",
        icon: ClipboardPenLine,
      },
      {
        label: "پیش‌ثبت‌نام مدرسه",
        href: "/admin/admission-applications",
        icon: FileText,
      },
    ],
  },
  {
    label: "آموزش",
    items: [
      {
        label: "برنامه‌های آموزشی",
        href: "/admin/programs",
        icon: CalendarDays,
      },
      {
        label: "ویدیوهای آموزشی",
        href: "/admin/videos",
        icon: PlaySquare,
      },
    ],
  },
  {
    label: "محتوای مدرسه",
    items: [
      {
        label: "اخبار",
        href: "/admin/news",
        icon: Newspaper,
      },
      {
        label: "رویدادها",
        href: "/admin/events",
        icon: CalendarDays,
      },
      {
        label: "اطلاعیه‌ها",
        href: "/admin/announcements",
        icon: Bell,
      },
      {
        label: "دانش‌آموزان برتر",
        href: "/admin/top-students",
        icon: Trophy,
      },
      {
        label: "تولدها",
        href: "/admin/birthdays",
        icon: Cake,
      },
    ],
  },
  {
    label: "ارتباطات",
    items: [
      {
        label: "پیام‌های رسیده",
        href: "/admin/messages",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "تنظیمات",
    items: [
      {
        label: "کاربران و دسترسی‌ها",
        href: "/admin/users",
        icon: UserCog,
      },
      {
        label: "تنظیمات مدرسه",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const pathname = usePathname() ?? "/admin";
  const { user, signOut } = useAuth();

  useEffect(() => {
    let mounted = true;

    const loadUnreadMessages = async () => {
      try {
        const response = await fetch("/api/admin/overview", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (mounted && typeof data.unreadMessages === "number") {
          setUnreadMessages(data.unreadMessages);
        }
      } catch {
        // The sidebar should remain usable even if overview data fails.
      }
    };

    loadUnreadMessages();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#FAF8F5] text-[#1A2332]"
    >
      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 cursor-default bg-[#1A2332]/35 backdrop-blur-[1px] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[272px] flex-col border-l border-[#E7E2DA] bg-white shadow-[0_8px_40px_rgba(26,35,50,0.06)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E7E2DA] px-5">
          <Link
            href="/admin"
            onClick={closeSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#194342] shadow-sm">
              <span className="text-base font-bold text-[#DBE7C1]">خ</span>
            </div>

            <div>
              <p className="text-[13px] font-bold text-[#194342]">
                پنل مدیریت
              </p>
              <p className="mt-0.5 text-[10px] text-[#667085]">
                دبیرستان شاهد حضرت خدیجه (س)
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="بستن منو"
            onClick={closeSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-[#F1F5E8] hover:text-[#194342] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="scrollbar-hide flex-1 overflow-y-auto px-3 py-4">
          {sidebarGroups.map((group, groupIndex) => (
            <div
              key={group.label ?? `group-${groupIndex}`}
              className={cn(
                groupIndex > 0 && "mt-5 border-t border-[#EEEAE3] pt-4",
              )}
            >
              {group.label && (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-wide text-[#98A2B3]">
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebar}
                      className={cn(
                        "group flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-[#F1F5E8] text-[#194342]"
                          : "text-[#667085] hover:bg-[#FAF8F5] hover:text-[#194342]",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[17px] w-[17px] shrink-0 transition-colors",
                          active
                            ? "text-[#194342]"
                            : "text-[#98A2B3] group-hover:text-[#194342]",
                        )}
                        strokeWidth={1.8}
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>

                      {item.href === "/admin/messages" &&
                        unreadMessages > 0 && (
                          <span
                            aria-label={`${unreadMessages} پیام خوانده‌نشده`}
                            className="flex min-w-5 h-5 items-center justify-center rounded-full bg-[#B86F5B] px-1.5 text-[10px] font-bold text-white"
                          >
                            {unreadMessages > 99 ? "99+" : unreadMessages}
                          </span>
                        )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-[#E7E2DA] p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-[10px] bg-[#FAF8F5] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DBE7C1] text-xs font-bold text-[#194342]">
              {user?.name?.[0] || "م"}
            </div>

            <div className="min-w-0 flex-1 lg:w-[calc(100%-272px)]">
              <p className="truncate text-xs font-semibold text-[#1A2332]">
                {user?.name || "مدیر"}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[#98A2B3]">
                {user?.email || "حساب مدیریت"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="flex h-9 w-full items-center gap-2 rounded-[10px] px-3 text-xs font-medium text-[#667085] transition-colors hover:bg-[#F1F5E8] hover:text-[#194342]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            خروج از حساب
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#E7E2DA] bg-[#FAF8F5]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="باز کردن منو"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] transition-colors hover:bg-white hover:text-[#194342] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="mr-auto flex items-center gap-2">
            {pathname !== "/admin" && (
              <Link
                href="/admin"
                className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#667085] transition-colors hover:bg-white hover:text-[#194342]"
              >
                بازگشت به مدیریت
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            )}

            <Link
              href="/"
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#667085] transition-colors hover:bg-white hover:text-[#194342]"
            >
              مشاهده سایت
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
