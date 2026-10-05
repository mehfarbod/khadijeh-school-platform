"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import JalaliDatePicker from "@/components/ui/JalaliDatePicker";
import { jalaliToGregorian } from "@/lib/date/jalali";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Year={id:string;title:string;startDate:string|null;endDate:string|null;isCurrent:boolean};

export default function AcademicYearsPage(){
 const [years,setYears]=useState<Year[]>([]),[open,setOpen]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [title,setTitle]=useState(""),[startDate,setStartDate]=useState(""),[endDate,setEndDate]=useState(""),[isCurrent,setIsCurrent]=useState(false);
 const load=async()=>{try{setLoading(true);const r=await fetch("/api/academic-years",{cache:"no-store"}),d=await r.json();if(!r.ok)throw Error(d.error);setYears(d)}catch(e){toast.error(e instanceof Error?e.message:"خطا")}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const create=async()=>{if(!title.trim())return toast.error("عنوان سال تحصیلی را وارد کنید.");setSaving(true);try{const r=await fetch("/api/academic-years",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title.trim(),startDate:startDate?jalaliToGregorian(startDate):undefined,endDate:endDate?jalaliToGregorian(endDate):undefined,isCurrent})}),d=await r.json();if(!r.ok)throw Error(d.error);toast.success("سال تحصیلی ایجاد شد.");setTitle("");setStartDate("");setEndDate("");setIsCurrent(false);setOpen(false);await load()}catch(e){toast.error(e instanceof Error?e.message:"خطا")}finally{setSaving(false)}};
 const date=(v:string|null)=>v?new Intl.DateTimeFormat("fa-IR",{year:"numeric",month:"long",day:"numeric"}).format(new Date(v)):"—";
 return <AdminLayout><div className="mx-auto max-w-5xl space-y-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-medium text-[#B86F5B]">تنظیمات آموزشی</p><h1 className="text-2xl font-bold">سال‌های تحصیلی</h1><p className="mt-2 text-sm text-muted-foreground">سال‌های تحصیلی را ایجاد کنید و سال جاری را مشخص کنید.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/admin/academic-years/promotion">ارتقای دانش‌آموزان</Link></Button><Button onClick={()=>setOpen(v=>!v)} className="gap-2 bg-[#194342]"><Plus className="h-4 w-4"/>افزودن سال تحصیلی</Button></div></div>
  {open&&<section className="rounded-2xl border bg-white p-5"><h2 className="text-sm font-bold">سال تحصیلی جدید</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><div><label className="text-xs font-medium">عنوان</label><Input className="mt-1.5" value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثلاً ۱۴۰۵-۱۴۰۶"/></div><div><label className="text-xs font-medium">شروع</label><JalaliDatePicker value={startDate} onChange={setStartDate} placeholder="تاریخ شروع" className="mt-1.5 h-10 w-full rounded-md border px-3 text-sm"/></div><div><label className="text-xs font-medium">پایان</label><JalaliDatePicker value={endDate} onChange={setEndDate} placeholder="تاریخ پایان" className="mt-1.5 h-10 w-full rounded-md border px-3 text-sm"/></div></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={isCurrent} onChange={e=>setIsCurrent(e.target.checked)}/>سال جاری باشد</label><div className="mt-5 flex gap-2"><Button onClick={create} disabled={saving}>{saving?"در حال ایجاد...":"ایجاد سال تحصیلی"}</Button><Button variant="outline" onClick={()=>setOpen(false)}>انصراف</Button></div></section>}
  <section className="overflow-hidden rounded-2xl border bg-white">{loading?<div className="p-8 text-center text-sm text-muted-foreground">در حال دریافت...</div>:years.length===0?<div className="p-12 text-center text-sm text-muted-foreground">هنوز سال تحصیلی ثبت نشده است.</div>:<div className="divide-y">{years.map(y=><div key={y.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F5E8] text-[#194342]"><CalendarDays className="h-5 w-5"/></div><div><div className="flex items-center gap-2"><h2 className="font-semibold">{y.title}</h2>{y.isCurrent&&<span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5E8] px-2.5 py-1 text-[11px] text-[#194342]"><CheckCircle2 className="h-3.5 w-3.5"/>سال جاری</span>}</div><p className="mt-1 text-xs text-muted-foreground">شروع: {date(y.startDate)} · پایان: {date(y.endDate)}</p></div></div></div>)}</div>}</section>
 </div></AdminLayout>;
}
