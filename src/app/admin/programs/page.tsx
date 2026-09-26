"use client";

import AdminLayout from "@/components/admin/AdminLayout";

import AdminLayout from "@/components/admin/AdminLayout";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Tab = "weekly" | "exams" | "calendar" | "parents-meetings" | "family-counseling";
const tabs: Array<[Tab, string]> = [
  ["weekly", "برنامه هفتگی"],
  ["exams", "برنامه امتحانات"],
  ["calendar", "تقویم آموزشی"],
  ["parents-meetings", "انجمن اولیا و مربیان"],
  ["family-counseling", "مشاوره خانواده"],
];

type WeeklyEntry = { className: string; day: string; startTime: string; endTime: string; subject: string; teacher: string };
type ExamEntry = { subject: string; date: string; time: string; grade: string; className: string };
type EventItem = { id: string; title: string; date: string; eventType: string; description: string; isActive: boolean };
type Meeting = { id: string; title: string; date: string; time: string | null; topic: string; audience: string | null; description: string; location: string | null; isActive: boolean };
type Session = { id: string; title: string; date: string; time: string | null; counselor: string; topic: string; audience: string | null; description: string; location: string | null; isActive: boolean };

const emptyWeekly = (): WeeklyEntry => ({ className: "", day: "شنبه", startTime: "", endTime: "", subject: "", teacher: "" });
const emptyExam = (): ExamEntry => ({ subject: "", date: "", time: "", grade: "", className: "" });

async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/uploads", { method: "POST", body: fd });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "بارگذاری تصویر ناموفق بود.");
  return data.url as string;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "text-xs font-medium text-[#475467] md:col-span-2" : "text-xs font-medium text-[#475467]"}>{label}{children}</label>;
}
const input = "mt-1.5 w-full rounded-lg border border-[#E7E2DA] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#194342]";
const button = "rounded-lg bg-[#194342] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50";

export default function AdminProgramsPage() {
  const [tab, setTab] = useState<Tab>("weekly");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [weeklyEntries, setWeeklyEntries] = useState<WeeklyEntry[]>([emptyWeekly()]);
  const [weeklyImage, setWeeklyImage] = useState("");
  const [weeklyActive, setWeeklyActive] = useState(true);
  const [examEntries, setExamEntries] = useState<ExamEntry[]>([emptyExam()]);
  const [examImage, setExamImage] = useState("");
  const [examActive, setExamActive] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const notify = (text: string) => { setMessage(text); window.setTimeout(() => setMessage(""), 3500); };

  async function loadList() {
    const [c, p, f] = await Promise.all([
      fetch("/api/programs/calendar?activeOnly=false", { cache: "no-store" }),
      fetch("/api/programs/parents-meetings?activeOnly=false", { cache: "no-store" }),
      fetch("/api/programs/family-counseling?activeOnly=false", { cache: "no-store" }),
    ]);
    if (c.ok) setEvents((await c.json()).events ?? []);
    if (p.ok) setMeetings((await p.json()).meetings ?? []);
    if (f.ok) setSessions((await f.json()).sessions ?? []);
  }

  async function loadSchedules() {
    const [w, e] = await Promise.all([
      fetch("/api/programs/weekly?activeOnly=false", { cache: "no-store" }),
      fetch("/api/programs/exams?activeOnly=false", { cache: "no-store" }),
    ]);
    if (w.ok) {
      const d = await w.json();
      setWeeklyImage(d.schedule?.imageUrl ?? "");
      setWeeklyActive(d.schedule?.isActive ?? true);
      if (d.schedule?.entries?.length) setWeeklyEntries(d.schedule.entries.map((x: WeeklyEntry) => ({ ...x })));
    }
    if (e.ok) {
      const d = await e.json();
      setExamImage(d.schedule?.imageUrl ?? "");
      setExamActive(d.schedule?.isActive ?? true);
      if (d.schedule?.entries?.length) setExamEntries(d.schedule.entries.map((x: ExamEntry) => ({ ...x })));
    }
  }

  useEffect(() => { loadSchedules().catch(() => notify("دریافت برنامه‌ها ناموفق بود.")); loadList().catch(() => notify("دریافت اطلاعات ناموفق بود.")); }, []);

  async function saveJson(url: string, body: unknown) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "ذخیره اطلاعات ناموفق بود.");
    return data;
  }

  async function saveWeekly(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await saveJson("/api/programs/weekly", { imageUrl: weeklyImage || undefined, isActive: weeklyActive, entries: weeklyEntries.filter(x => x.className && x.startTime && x.subject) }); notify("برنامه هفتگی ذخیره شد."); }
    catch (e) { notify(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }

  async function saveExams(e: FormEvent) {
    e.preventDefault(); setBusy(true);
    try { await saveJson("/api/programs/exams", { imageUrl: examImage || undefined, isActive: examActive, entries: examEntries.filter(x => x.subject && x.date && x.grade) }); notify("برنامه امتحانات ذخیره شد."); }
    catch (e) { notify(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>, setter: (v: string) => void) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { setter(await uploadImage(file)); notify("تصویر با موفقیت بارگذاری شد."); }
    catch (err) { notify(err instanceof Error ? err.message : "بارگذاری ناموفق بود."); }
    finally { setBusy(false); e.target.value = ""; }
  }

  async function submitSimple(url: string, body: unknown, after: () => Promise<void>) {
    setBusy(true);
    try { await saveJson(url, body); await after(); notify("اطلاعات با موفقیت ذخیره شد."); }
    catch (e) { notify(e instanceof Error ? e.message : "خطا"); } finally { setBusy(false); }
  }

  return (
    <AdminLayout>
      <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#194342]">مدیریت برنامه‌های آموزشی</h1>
        <p className="mt-1 text-xs text-[#667085]">هر بخش ساختار مستقل خودش را دارد؛ اطلاعات ساختاریافته و تصویر رسمی می‌توانند جداگانه استفاده شوند.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E7E2DA] bg-white p-2">
        {tabs.map(([value, label]) => <button key={value} type="button" onClick={() => { setTab(value); setMessage(""); }} className={`rounded-xl px-4 py-2.5 text-xs font-semibold ${tab === value ? "bg-[#194342] text-white" : "text-[#475467] hover:bg-[#F7F5F1]"}`}>{label}</button>)}
      </div>

      {message && <div className="rounded-xl border border-[#D9E7E2] bg-[#F4FAF8] px-4 py-3 text-xs font-medium text-[#194342]">{message}</div>}

      {tab === "weekly" && <form onSubmit={saveWeekly} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[#194342]">برنامه هفتگی</h2>
        <p className="mt-1 text-xs text-[#667085]">برای هر کلاس چند ردیف ثبت کنید. تصویر برنامه هم کاملاً اختیاری است.</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#EEEAE3]">
          <table className="min-w-[900px] w-full text-xs">
            <thead><tr className="bg-[#F8F6F2] text-[#475467]"><th className="p-3">کلاس</th><th>روز</th><th>شروع</th><th>پایان</th><th>درس</th><th>دبیر</th><th></th></tr></thead>
            <tbody>{weeklyEntries.map((row, i) => <tr key={i} className="border-t border-[#EEEAE3]">
              {(["className","day","startTime","endTime","subject","teacher"] as const).map((key) => <td key={key} className="p-2"><input value={row[key]} onChange={e => setWeeklyEntries(a => a.map((x,j) => j===i ? {...x,[key]:e.target.value}:x))} className="w-full rounded-lg border border-[#E7E2DA] px-2.5 py-2" placeholder={key === "className" ? "۱۰۱" : key === "subject" ? "ریاضی" : key === "teacher" ? "نام دبیر" : ""} /></td>)}
              <td className="p-2"><button type="button" onClick={() => setWeeklyEntries(a => a.filter((_,j)=>j!==i))} className="rounded-lg border px-2 py-2 text-[11px]">حذف</button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <button type="button" onClick={() => setWeeklyEntries(a => [...a, emptyWeekly()])} className="mt-3 rounded-lg border border-[#E7E2DA] px-4 py-2.5 text-xs font-semibold">+ افزودن ردیف</button>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="تصویر برنامه (اختیاری)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handleUpload(e,setWeeklyImage)} className={input+" file:ml-3 file:rounded-md file:border-0 file:bg-[#F3F1EC] file:px-3 file:py-1.5"} />{weeklyImage && <p className="mt-2 text-[11px] text-[#667085]">تصویر انتخاب شده است.</p>}</Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs"><input type="checkbox" checked={weeklyActive} onChange={e=>setWeeklyActive(e.target.checked)} /> انتشار در سایت</label>
        <button disabled={busy} className={`mt-5 ${button}`}>{busy ? "در حال ذخیره..." : "ذخیره برنامه هفتگی"}</button>
      </form>}

      {tab === "exams" && <form onSubmit={saveExams} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[#194342]">برنامه امتحانات</h2>
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#EEEAE3]">
          <table className="min-w-[850px] w-full text-xs"><thead><tr className="bg-[#F8F6F2]"><th className="p-3">درس</th><th>تاریخ</th><th>ساعت</th><th>پایه</th><th>کلاس</th><th></th></tr></thead>
          <tbody>{examEntries.map((row,i)=><tr key={i} className="border-t border-[#EEEAE3]">{(["subject","date","time","grade","className"] as const).map(key=><td key={key} className="p-2"><input value={row[key]} onChange={e=>setExamEntries(a=>a.map((x,j)=>j===i?{...x,[key]:e.target.value}:x))} className="w-full rounded-lg border border-[#E7E2DA] px-2.5 py-2" placeholder={key==="date"?"۱۴۰۵/۱۰/۰۵":key==="grade"?"دهم":""}/></td>)}<td className="p-2"><button type="button" onClick={()=>setExamEntries(a=>a.filter((_,j)=>j!==i))} className="rounded-lg border px-2 py-2 text-[11px]">حذف</button></td></tr>)}</tbody></table>
        </div>
        <button type="button" onClick={()=>setExamEntries(a=>[...a,emptyExam()])} className="mt-3 rounded-lg border border-[#E7E2DA] px-4 py-2.5 text-xs font-semibold">+ افزودن امتحان</button>
        <div className="mt-5"><Field label="تصویر برنامه امتحانات (اختیاری)"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>handleUpload(e,setExamImage)} className={input+" file:ml-3 file:rounded-md file:border-0 file:bg-[#F3F1EC] file:px-3 file:py-1.5"}/></Field></div>
        <label className="mt-4 flex items-center gap-2 text-xs"><input type="checkbox" checked={examActive} onChange={e=>setExamActive(e.target.checked)}/> انتشار در سایت</label>
        <button disabled={busy} className="mt-5 ${button}">{busy ? "در حال ذخیره..." : "ذخیره برنامه امتحانات"}</button>
      </form>}

      {tab === "calendar" && <SimpleManager title="تقویم آموزشی" items={events} fields={[["title","عنوان"],["date","تاریخ"],["eventType","نوع رویداد"],["description","توضیحات"]]} createUrl="/api/programs/calendar" onRefresh={loadList} />}
      {tab === "parents-meetings" && <SimpleManager title="جلسات انجمن اولیا و مربیان" items={meetings} fields={[["title","عنوان"],["date","تاریخ"],["time","ساعت"],["topic","موضوع"],["audience","مخاطبان"],["description","توضیحات"],["location","مکان"]]} createUrl="/api/programs/parents-meetings" onRefresh={loadList} />}
      {tab === "family-counseling" && <SimpleManager title="جلسات مشاوره خانواده" items={sessions} fields={[["title","عنوان"],["date","تاریخ"],["time","ساعت"],["counselor","مشاور"],["topic","موضوع"],["audience","مخاطبان"],["description","توضیحات"],["location","مکان"]]} createUrl="/api/programs/family-counseling" onRefresh={loadList} />}
      </div>
    </AdminLayout>
  );

  function SimpleManager({ title, items, fields, createUrl, onRefresh }: { title:string; items:Array<{id:string;title:string;isActive:boolean}>; fields:Array<[string,string]>; createUrl:string; onRefresh:()=>Promise<void> }) {
    const [form,setForm]=useState<Record<string,string>>({});
    const [saving,setSaving]=useState(false);
    async function submit(e:FormEvent){e.preventDefault();setSaving(true);try{await saveJson(createUrl,{...form,isActive:true});setForm({});await onRefresh();notify("مورد جدید ذخیره شد.");}catch(e){notify(e instanceof Error?e.message:"خطا");}finally{setSaving(false);}}
    async function remove(id:string){if(!confirm("این مورد حذف شود؟"))return;setBusy(true);try{const r=await fetch(createUrl+"?id="+id,{method:"DELETE"});if(!r.ok)throw new Error((await r.json()).error||"حذف ناموفق بود.");await onRefresh();notify("مورد حذف شد.");}catch(e){notify(e instanceof Error?e.message:"خطا");}finally{setBusy(false);}}
    return <section className="space-y-5">
      <form onSubmit={submit} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6"><h2 className="text-sm font-bold text-[#194342]">{title}</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{fields.map(([key,label])=><Field key={key} label={label} wide={key==="description"}><input required={!["time","audience","location"].includes(key)} value={form[key]??""} onChange={e=>setForm({...form,[key]:e.target.value})} className={input}/></Field>)}</div><button disabled={saving||busy} className={`mt-5 ${button}`}>{saving?"در حال ذخیره...":"افزودن مورد"}</button></form>
      <section className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6"><h2 className="text-sm font-bold text-[#194342]">موارد ثبت‌شده</h2><div className="mt-4 space-y-2">{items.map(x=><div key={x.id} className="flex items-center gap-3 rounded-xl border border-[#EEEAE3] p-4"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{x.title}</p><p className="mt-1 text-[11px] text-[#667085]">{x.isActive?"فعال":"غیرفعال"}</p></div><button type="button" onClick={()=>remove(x.id)} className="rounded-lg border border-[#E7E2DA] px-3 py-2 text-[11px]">حذف</button></div>)}</div></section>
    </section>;
  }
}
