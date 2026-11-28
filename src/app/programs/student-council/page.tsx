import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";

export default function StudentCouncilPage() {
  return (
    <>
      <Header />
      <main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-[1000px]">
          <Link href="/programs" className="inline-flex items-center gap-2 text-xs font-semibold text-[#194342]">
            <ArrowRight className="h-4 w-4" /> بازگشت به آموزش
          </Link>
          <section className="mt-6 rounded-[22px] border border-[#DBE7C1] bg-white p-7 shadow-[0_12px_40px_rgba(25,67,66,0.06)] sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DBE7C1]/60">
              <UsersRound className="h-7 w-7 text-[#194342]" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-[#194342]">شورای دانش‌آموزی</h1>
            <p className="mt-3 text-sm leading-8 text-[#667085]">
              اطلاعیه‌ها و برنامه‌های شورای دانش‌آموزی مدرسه از این بخش در دسترس قرار می‌گیرد.
            </p>
          </section>
        </div>
      </main>
      <CoursesFooter />
    </>
  );
}
