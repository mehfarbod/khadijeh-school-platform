import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

const labels: Record<string, string> = {
  weekly: "برنامه هفتگی",
  exams: "برنامه امتحانات",
  calendar: "تقویم آموزشی",
  "parents-meetings": "جلسات انجمن اولیا و مربیان",
  "family-counseling": "جلسات مشاوره خانواده",
};

export default async function ProgramDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const program = await prisma.educationalProgram.findFirst({ where: { type, isActive: true } });
  if (!program) notFound();

  return (
    <>
      <Header />
      <main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-[1000px]">
          <Link href="/programs" className="inline-flex items-center gap-2 text-xs font-semibold text-[#194342]">
            <ArrowRight className="h-4 w-4" /> بازگشت به برنامه‌های آموزشی
          </Link>
          <article className="mt-6 rounded-[22px] border border-[#DBE7C1] bg-white p-6 shadow-[0_12px_40px_rgba(25,67,66,0.06)] sm:p-9">
            <p className="text-xs font-semibold text-[#667085]">{labels[type] ?? program.title}</p>
            <h1 className="mt-3 text-2xl font-bold text-[#194342]">{program.title}</h1>
            <p className="mt-3 text-sm leading-8 text-[#667085]">{program.description}</p>
            {(program.startDate || program.endDate) && (
              <div className="mt-5 text-xs text-[#667085]">
                {program.startDate && <>از {program.startDate}</>}
                {program.endDate && <> تا {program.endDate}</>}
              </div>
            )}
            {program.content ? (
              <div className="mt-7 whitespace-pre-wrap border-t border-[#EEEAE3] pt-6 text-sm leading-9 text-[#344054]">{program.content}</div>
            ) : (
              <div className="mt-7 rounded-xl bg-[#FAF8F5] px-5 py-10 text-center text-sm text-[#98A2B3]">محتوای این برنامه هنوز توسط مدرسه منتشر نشده است.</div>
            )}
          </article>
        </div>
      </main>
      <CoursesFooter />
    </>
  );
}