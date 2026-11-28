import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScientificGroupsPage() {
  const groups = await prisma.scientificGroup.findMany({ where: { isPublished: true }, orderBy: { name: "asc" }, select: { id: true, name: true, description: true, _count: { select: { minutes: { where: { isPublished: true } } } } } });
  return <><Header /><main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-12 sm:px-6"><div className="mx-auto max-w-[1100px]"><div className="text-center"><h1 className="text-3xl font-bold text-[#194342]">گروه‌های علمی</h1><p className="mt-3 text-sm text-[#667085]">فعالیت‌ها و صورت‌جلسات گروه‌های علمی مدرسه</p></div>{groups.length ? <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{groups.map((group)=><Link key={group.id} href={`/scientific-groups/${group.id}`} className="group rounded-2xl border border-[#DBE7C1] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5E8]"><FlaskConical className="h-6 w-6 text-[#194342]" /></div><h2 className="mt-4 font-bold text-[#1F2933]">{group.name}</h2><p className="mt-2 line-clamp-3 text-xs leading-7 text-[#667085]">{group.description || "برای مشاهده صورت‌جلسات وارد صفحه گروه شوید."}</p><div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#194342]"><span>{group._count.minutes} صورت‌جلسه</span><ArrowLeft className="h-4 w-4" /></div></Link>)}</div>:<div className="mt-9 rounded-2xl border border-dashed border-[#DBE7C1] bg-white p-12 text-center text-sm text-[#667085]">هنوز گروه علمی منتشرشده‌ای وجود ندارد.</div>}</div></main><CoursesFooter /></>;
}
