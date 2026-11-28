import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScientificGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await prisma.scientificGroup.findFirst({ where: { id, isPublished: true }, select: { name: true, description: true, minutes: { where: { isPublished: true }, orderBy: [{ heldOn: "desc" }, { createdAt: "desc" }], select: { id: true, title: true, heldOn: true, content: true } } } });
  if (!group) notFound();
  return <><Header /><main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-12 sm:px-6"><div className="mx-auto max-w-[900px]"><Link href="/scientific-groups" className="inline-flex items-center gap-2 text-xs font-semibold text-[#194342]"><ArrowRight className="h-4 w-4" />بازگشت به گروه‌های علمی</Link><header className="mt-6 rounded-2xl border border-[#DBE7C1] bg-white p-7"><h1 className="text-2xl font-bold text-[#194342]">{group.name}</h1>{group.description&&<p className="mt-3 text-sm leading-8 text-[#667085]">{group.description}</p>}</header><div className="mt-6 space-y-4">{group.minutes.length?group.minutes.map((minute)=><article key={minute.id} className="rounded-2xl border border-[#DBE7C1] bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-[#1F2933]">{minute.title}</h2>{minute.heldOn&&<span className="inline-flex items-center gap-1.5 text-xs text-[#667085]"><CalendarDays className="h-4 w-4" />{new Intl.DateTimeFormat("fa-IR",{dateStyle:"long"}).format(minute.heldOn)}</span>}</div><div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[#475467]">{minute.content}</div></article>):<div className="rounded-2xl border border-dashed border-[#DBE7C1] bg-white p-10 text-center text-sm text-[#667085]">هنوز صورت‌جلسه‌ای منتشر نشده است.</div>}</div></div></main><CoursesFooter /></>;
}
