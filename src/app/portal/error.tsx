"use client";

import Link from "next/link";

export default function StudentPortalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-8" dir="rtl">
      <section className="w-full max-w-md rounded-2xl border border-[#E7E2DA] bg-white p-6 text-center shadow-[0_12px_40px_rgba(26,35,50,0.06)] sm:p-8">
        <h1 className="text-lg font-bold text-[#1A2332]">نمایش پرتال با مشکل روبه‌رو شد</h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، با مدرسه تماس بگیرید.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#194342] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#123332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2"
          >
            تلاش دوباره
          </button>
          <Link
            href="/portal"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D5DECB] bg-[#FCFDF9] px-4 text-sm font-semibold text-[#194342] transition-colors hover:bg-[#F1F5E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </section>
    </main>
  );
}
