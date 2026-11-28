import { Award } from "lucide-react";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";
import StudentIllustrationPlaceholder from "@/components/ui/StudentIllustrationPlaceholder";

export const dynamic = "force-dynamic";

export default async function OutstandingStudentsPage() {
  const records = await prisma.outstandingStudent.findMany({ where: { isPublished: true, student: { isActive: true } }, orderBy: [{ academicYear: { title: "desc" } }, { semester: "asc" }, { student: { lastName: "asc" } }], select: { semester: true, student: { select: { firstName: true, lastName: true } }, academicYear: { select: { title: true } } } });
  const latestYear = records[0]?.academicYear.title;
  const visible = records.filter((record)=>record.academicYear.title===latestYear);
  const sections = [{key:"FIRST" as const,label:"نیم‌سال اول"},{key:"SECOND" as const,label:"نیم‌سال دوم"}];
  return <><Header /><main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-12 sm:px-6"><div className="mx-auto max-w-[1000px]"><div className="text-center"><Award className="mx-auto h-10 w-10 text-[#B86F5B]"/><h1 className="mt-4 text-3xl font-bold text-[#194342]">دانش‌آموزان ممتاز</h1>{latestYear&&<p className="mt-3 text-sm text-[#667085]">سال تحصیلی {latestYear}</p>}</div><div className="mt-9 grid gap-6 md:grid-cols-2">{sections.map((section)=>{const items=visible.filter((item)=>item.semester===section.key);return <section key={section.key} className="rounded-2xl border border-[#DBE7C1] bg-white p-6"><h2 className="border-b border-[#EEEAE3] pb-4 text-lg font-bold text-[#194342]">{section.label}</h2>{items.length?<ul className="mt-3 divide-y divide-[#EEEAE3]">{items.map((item,index)=><li key={`${item.student.firstName}-${item.student.lastName}-${index}`} className="flex items-center gap-3 py-3"><div className="relative"><StudentIllustrationPlaceholder variant="outstanding" className="w-10 rounded-xl"/><span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#F1F5E8] text-[10px] font-bold text-[#194342]">{index+1}</span></div><span className="text-sm font-semibold text-[#1F2933]">{item.student.firstName} {item.student.lastName}</span></li>)}</ul>:<p className="py-8 text-center text-sm text-[#98A2B3]">موردی منتشر نشده است.</p>}</section>})}</div></div></main><CoursesFooter /></>;
}
