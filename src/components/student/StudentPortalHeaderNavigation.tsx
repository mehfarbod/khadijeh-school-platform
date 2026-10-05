"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  Home,
  UserRound,
} from "lucide-react";

import StudentLogoutButton from "@/components/student/StudentLogoutButton";

const navigationItems = [
  { href: "/portal/grades", label: "نمرات و کارنامه", icon: GraduationCap },
  { href: "/portal/courses", label: "دوره‌های من", icon: BookOpen },
  {
    href: "/portal/review-items",
    label: "موارد نیازمند بررسی",
    icon: ClipboardList,
  },
  { href: "/portal/profile", label: "پروفایل", icon: UserRound },
];

const focusClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2";

export default function StudentPortalHeaderNavigation({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="rounded-2xl border border-[#E7E2DA] bg-white shadow-[0_10px_35px_rgba(26,35,50,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            aria-label="پرتال دانش‌آموز"
            aria-current={pathname === "/portal" ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#194342] text-[#DBE7C1] shadow-sm transition-transform hover:-translate-y-0.5 ${focusClassName}`}
          >
            <Home className="h-4.5 w-4.5" strokeWidth={1.8} />
          </Link>
          <div>
            <p className="text-[11px] font-medium text-[#98A2B3]">پرتال دانش‌آموز</p>
            <h1 className="mt-0.5 text-lg font-bold text-[#1A2332]">{title}</h1>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
            ) : null}
          </div>
        </div>
      </div>

      <nav
        aria-label="بخش‌های پرتال دانش‌آموز"
        className="grid grid-cols-2 gap-2 border-t border-[#EEEAE3] p-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-center text-xs font-semibold transition-colors ${focusClassName} ${
                isCurrent
                  ? "bg-[#194342] text-white shadow-sm"
                  : "text-[#667085] hover:bg-[#F1F5E8] hover:text-[#194342]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/"
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-center text-xs font-semibold text-[#194342] transition-colors hover:bg-[#F1F5E8] ${focusClassName}`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          <span>مشاهده سایت</span>
        </Link>
        <StudentLogoutButton />
      </nav>
    </header>
  );
}
