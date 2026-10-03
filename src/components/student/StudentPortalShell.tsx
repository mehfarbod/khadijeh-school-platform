import Link from "next/link";
import { ArrowRight, Home, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import StudentLogoutButton from "@/components/student/StudentLogoutButton";

export default function StudentPortalShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-[#E7E2DA] bg-white shadow-[0_10px_35px_rgba(26,35,50,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/portal"
                aria-label="پرتال دانش‌آموز"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#194342] text-[#DBE7C1] shadow-sm transition-transform hover:-translate-y-0.5"
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

            <div className="flex items-center gap-1.5">
              <Link
                href="/portal/profile"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#667085] transition-colors hover:bg-[#F1F5E8] hover:text-[#194342]"
              >
                <UserRound className="h-3.5 w-3.5" strokeWidth={1.8} />
                پروفایل
              </Link>
              <StudentLogoutButton />
            </div>
          </div>
        </header>

        {children}

        <div className="pt-1">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] transition-colors hover:text-[#194342]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </main>
  );
}
