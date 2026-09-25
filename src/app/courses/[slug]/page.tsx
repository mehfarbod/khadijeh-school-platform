import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";

type Course = {
  id:string; slug:string; title:string; description:string; fullDescription:string|null; coverImage:string|null;
  instructor:string|null; startDate:string|null; endDate:string|null; schedule:string|null; duration:string|null;
  capacity:number; price:number|null; status:"active"|"upcoming"; category:string; gradeLevel:string|null;
  registrationDeadline:string|null; currentRegistrations:number; isActive:boolean;
};

async function getCourse(slug:string):Promise<Course|null>{
  const base=process.env.NEXT_PUBLIC_APP_URL;
  const url=base ? `${base}/api/courses?slug=${encodeURIComponent(slug)}` : `http://localhost:3000/api/courses?slug=${encodeURIComponent(slug)}`;
  const res=await fetch(url,{cache:"no-store"});
  if(!res.ok) return null;
  return res.json();
}

export default async function CourseDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const course=await getCourse(slug); if(!course) notFound();
  const full=course.currentRegistrations>=course.capacity; const active=course.status==="active"&&!full;
  return <><Header/><main className="min-h-screen bg-[#FAF8F3]">
    <section className="bg-[#194342]"><div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-6">
      <Link href="/courses" className="text-xs text-[#DBE7C1]/80">← بازگشت به دوره‌ها</Link>
      <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><span className="rounded-full bg-[#DBE7C1]/15 px-3 py-1 text-xs text-[#DBE7C1]">{active?"در حال ثبت‌نام":full?"تکمیل ظرفیت":"به‌زودی"}</span><h1 className="mt-4 text-[clamp(28px,5vw,44px)] font-bold leading-[1.4] text-white">{course.title}</h1><p className="mt-4 text-sm leading-8 text-[#DBE7C1]/85">{course.description}</p></div>{active&&<Link href={`/courses/registration?course=${encodeURIComponent(course.slug)}`} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#B86F5B] px-6 text-sm font-medium text-white">ثبت‌نام در دوره</Link>}</div>
    </div></section>
    <section className="mx-auto max-w-[1000px] px-5 py-10 sm:px-6">
      <div className="grid gap-5 md:grid-cols-4">{[["پایه",course.gradeLevel],["مدرس",course.instructor],["زمان",course.schedule],["مدت",course.duration]].map(([l,v])=><div key={l} className="rounded-xl border border-[#DBE7C1] bg-white p-4"><p className="text-xs text-[#98A2B3]">{l}</p><p className="mt-2 text-sm font-medium text-[#194342]">{v||"—"}</p></div>)}</div>
      <div className="mt-6 rounded-2xl border border-[#DBE7C1] bg-white p-6 sm:p-8"><h2 className="text-lg font-bold text-[#194342]">درباره دوره</h2><p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#667085]">{course.fullDescription||course.description}</p></div>
    </section>
  </main><CoursesFooter/></>;
}
