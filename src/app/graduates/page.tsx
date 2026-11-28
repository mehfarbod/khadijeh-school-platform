import { GraduationCap } from "lucide-react";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GraduatesPage() {
  const graduates = await prisma.graduate.findMany({ where: { isPublished: true }, orderBy: [{ entranceExamYear: "desc" }, { lastName: "asc" }], select: { firstName: true, lastName: true, entranceExamYear: true, major: true, university: true } });
  return <><Header /><main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-12 sm:px-6"><div className="mx-auto max-w-[1100px]"><div className="text-center"><GraduationCap className="mx-auto h-10 w-10 text-[#194342]"/><h1 className="mt-4 text-3xl font-bold text-[#194342]">فارغ‌التحصیلان</h1><p className="mt-3 text-sm text-[#667085]">افتخارآفرینان سال‌های گذشته مدرسه</p></div>{graduates.length?<div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{graduates.map((graduate,index)=><article key={`${graduate.firstName}-${graduate.lastName}-${index}`} className="rounded-2xl border border-[#DBE7C1] bg-white p-5"><h2 className="font-bold text-[#1F2933]">{graduate.firstName} {graduate.lastName}</h2><dl className="mt-4 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-[#667085]">سال کنکور</dt><dd className="font-semibold">{graduate.entranceExamYear}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#667085]">رشته</dt><dd className="font-semibold">{graduate.major}</dd></div><div className="flex justify-between gap-3"><dt className="text-[#667085]">دانشگاه</dt><dd className="text-left font-semibold">{graduate.university}</dd></div></dl></article>)}</div>:<div className="mt-9 rounded-2xl border border-dashed border-[#DBE7C1] bg-white p-12 text-center text-sm text-[#667085]">هنوز رکوردی منتشر نشده است.</div>}</div></main><CoursesFooter /></>;
}
