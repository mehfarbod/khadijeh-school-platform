"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Newspaper, Calendar, Bell, Trophy, Cake,
  LogOut, ChevronLeft, Menu, X, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { label: "دانش‌آموزان", href: "/admin/students", icon: Users },
  { label: "کادر مدرسه", href: "/admin/staff", icon: GraduationCap },
  { label: "دوره‌ها", href: "/admin/courses", icon: BookOpen },
  { label: "ثبت‌نام دوره‌ها", href: "/admin/registrations", icon: BookOpen },
  { label: "اخبار", href: "/admin/news", icon: Newspaper },
  { label: "رویدادها", href: "/admin/events", icon: Calendar },
  { label: "اعلامیه‌ها", href: "/admin/announcements", icon: Bell },
  { label: "دانش‌آموزان برتر", href: "/admin/top-students", icon: Trophy },
  { label: "تولدها", href: "/admin/birthdays", icon: Cake },
  { label: "پیام‌های تماس", href: "/admin/messages", icon: Phone },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? "/admin";
  const { user, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 border-l border-border/60 bg-card transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border/60 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                خ
              </div>
              <span className="text-sm font-bold text-foreground">پنل مدیریت</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-border/60 p-3">
            <div className="flex items-center gap-2 mb-2 px-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {user?.name?.[0] || "م"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{user?.name || "مدیر"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            مشاهده سایت
            <ChevronLeft className="h-3 w-3" />
          </Link>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
