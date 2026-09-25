"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";

type Course = { id:string; slug:string; title:string; description:string; gradeLevel:string|null; schedule:string|null; capacity:number; currentRegistrations:number; status:"active"|"upcoming"; isActive:boolean; registrationDeadline:string|null; };

function normalizeDigits(value:string){ return value.replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d))); }

function Content(){
  const router=useRouter(); const params=useSearchParams(); const slug=params.get("course");
  const [course,setCourse]=useState<Course|null>(null); const [loading,setLoading]=useState(true);
  const [form,setForm]=useState({studentFirstName:"",studentLastName:"",grade:"",guardianName:"",guardianPhone:"",email:"",notes:""});
  const [error,setError]=useState(""); const [submitted,setSubmitted]=useState(false); const [saving,setSaving]=useState(false);

  useEffect(()=>{ if(!slug){router.replace("/courses");return;} fetch(`/api/courses?slug=${encodeURIComponent(slug)}`).then(async r=>{const d=await r.json(); if(!r.ok) throw new Error(d?.error||"دوره پیدا نشد."); setCourse(d);}).catch(()=>router.replace("/courses")).finally(()=>setLoading(false)); },[slug,router]);

  if(loading||!course) return <><Header/><main className="min-h-[500px] bg-[#FAF8F3]"/><CoursesFooter/></>;
  const set=(key:keyof typeof form,value:string)=>setForm(f=>({...f,[key]:value}));
  const submit=async(e:FormEvent)=>{e.preventDefault();setError("");setSaving(true);try{
    const r=await fetch("/api/course-registrations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,courseId:course.id,guardianPhone:normalizeDigits(form.guardianPhone).replace(/\s|-/g,""),email:form.email||null,notes:form.notes||null})});
    const d=await r.json(); if(!r.ok) throw new Error(d?.error||"ثبت درخواست انجام نشد."); setSubmitted(true);
  }catch(e){setError(e instanceof Error?e.message:"خطا در ثبت درخواست.");}finally{setSaving(false);}};
  return <><Header/><main className="min-h-screen bg-[#FAF8F3]">
    <section className="bg-[#194342]"><div className="mx-auto max-w-[900px] px-5 py-12 text-center sm:px-6"><span className="rounded-full border border-[#DBE7C1]/30 bg-[#DBE7C1]/15 px-3 py-1 text-xs text-[#DBE7C1]">ثبت‌نام دوره</span><h1 className="mt-4 text-[clamp(26px,5vw,38px)] font-bold text-white">{course.title}</h1><p className="mt-3 text-sm leading-7 text-[#DBE7C1]/85">{course.description}</p></div></section>
    <section className="mx-auto max-w-[760px] px-5 py-10 sm:px-6">
      <Link href={`/courses/${encodeURIComponent(course.slug)}`} className="mb-5 inline-flex text-xs text-[#194342]">← بازگشت به صفحه دوره</Link>
      <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-5 sm:p-8">
      {submitted ? <div className="py-10 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DBE7C1] text-2xl text-[#194342]">✓</div><h2 className="mt-5 text-xl font-bold text-[#194342]">درخواست شما ثبت شد</h2><p className="mt-3 text-sm leading-7 text-[#667085]">درخواست ثبت‌نام شما برای «{course.title}» دریافت شد و پس از بررسی با شما تماس گرفته می‌شود.</p><Link href="/courses" className="mt-7 inline-flex rounded-lg bg-[#194342] px-5 py-2.5 text-sm text-white">بازگشت به دوره‌ها</Link></div> :
      <><h2 className="text-lg font-bold text-[#194342]">اطلاعات ثبت‌نام</h2><p className="mt-2 text-xs text-[#667085]">اطلاعات دانش‌آموز و ولی را وارد کنید.</p>
      {error&&<div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
        {([["studentFirstName","نام دانش‌آموز"],["studentLastName","نام خانوادگی دانش‌آموز"],["guardianName","نام و نام خانوادگی ولی"],["guardianPhone","شماره تلفن همراه ولی"]] as const).map(([key,label])=><label key={key} className="text-sm">{label}<input required className="mt-1.5 h-11 w-full rounded-lg border border-[#DBE7C1] px-3 outline-none focus:border-[#194342]" value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={key==="guardianPhone"?"09123456789":""}/></label>)}
        <label className="text-sm">پایه تحصیلی<select required className="mt-1.5 h-11 w-full rounded-lg border border-[#DBE7C1] bg-white px-3 outline-none focus:border-[#194342]" value={form.grade} onChange={e=>set("grade",e.target.value)}><option value="">انتخاب پایه</option><option value="10">پایه دهم</option><option value="11">پایه یازدهم</option><option value="12">پایه دوازدهم</option></select></label>
        <label className="text-sm">ایمیل (اختیاری)<input type="email" className="mt-1.5 h-11 w-full rounded-lg border border-[#DBE7C1] px-3 outline-none focus:border-[#194342]" value={form.email} onChange={e=>set("email",e.target.value)}/></label>
        <label className="text-sm sm:col-span-2">توضیحات (اختیاری)<textarea rows={4} className="mt-1.5 w-full rounded-lg border border-[#DBE7C1] px-3 py-2 outline-none focus:border-[#194342]" value={form.notes} onChange={e=>set("notes",e.target.value)}/></label>
        <button disabled={saving} className="sm:col-span-2 h-11 rounded-lg bg-[#B86F5B] text-sm font-medium text-white disabled:opacity-60">{saving?"در حال ثبت...":"ثبت درخواست ثبت‌نام"}</button>
      </form></>}
      </div>
    </section>
  </main><CoursesFooter/></>;
}
export default function CourseRegistrationPage(){return <Suspense fallback={null}><Content/></Suspense>;}
