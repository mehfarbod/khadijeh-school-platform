import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import StudentPortalHeaderNavigation from "@/components/student/StudentPortalHeaderNavigation";

export default function StudentPortalShell({
  children,
  title,
  description,
  showDashboardLink = true,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  showDashboardLink?: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <StudentPortalHeaderNavigation title={title} description={description} />

        {children}

        {showDashboardLink ? (
          <div className="pt-1">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] transition-colors hover:text-[#194342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              بازگشت به داشبورد
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
