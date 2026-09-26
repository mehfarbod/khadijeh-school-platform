"use client";

import { FormEvent, useEffect, useState } from "react";

const types = [
  ["weekly", "برنامه هفتگی"],
  ["exams", "برنامه امتحانات"],
  ["calendar", "تقویم آموزشی"],
  ["parents-meetings", "جلسات انجمن اولیا و مربیان"],
  ["family-counseling", "جلسات مشاوره خانواده"],
];

type Program = {
  id: string; type: string; title: string; description: string;
  content: string | null; startDate: string | null; endDate: string | null; isActive: boolean;
};

export default function AdminProgramsPage() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    type: "weekly", title: "برنامه هفتگی", description: "", content: "",
    startDate: "", endDate: "", isActive: true,
  });

  async function load() {
    const r = await fetch("/api/programs?activeOnly=false", { cache: "no-store" });
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  function changeType(type: string) {
    const label = types.find(([value]) => value === type)?.[1] ?? "";
    setForm((f) => ({ ...f, type, title: label }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setSubmitting(true); setMessage("");
    try {
      const r = await fetch("/api/programs", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) { setMessage(data.error || "ذخیره برنامه ناموفق بود."); return; }
      setMessage("برنامه با موفقیت ذخیره شد.");
      setForm({ type: form.type, title: form.title, description: "", content: "", startDate: "", endDate: "", isActive: true });
      await load();
    } catch { setMessage("ارتباط با سرور برقرار نشد."); }
    finally { setSubmitting(false); }
  }

  async function toggle(item: Program) {
    const r = await fetch(`/api/programs?id=${item.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (r.ok) await load();
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div><h1 className="text-xl font-bold text-[#194342]">برنامه‌های آموزشی</h1><p className="mt-1 text-xs text-[#667085]">مدیریت محتوای پنج بخش آموزشی مدرسه</p></div>

      <form onSubmit={submit} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[#194342]">افزودن برنامه</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-medium text-[#475467]">نوع برنامه
            <select value={form.type} onChange={(e) => changeType(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] bg-white px-3 py-2.5 text-sm">
              {types.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-[#475467]">عنوان
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-medium text-[#475467] md:col-span-2">توضیح کوتاه
            <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-medium text-[#475467] md:col-span-2">محتوای برنامه
            <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" placeholder="جزئیات برنامه را وارد کنید..." />
          </label>
          <label className="text-xs font-medium text-[#475467]">از تاریخ
            <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="۱۴۰۵/۰۷/۰۱" className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-medium text-[#475467]">تا تاریخ
            <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} placeholder="۱۴۰۵/۰۷/۳۰" className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-xs text-[#475467]"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> انتشار در سایت</label>
        {message && <p className="mt-4 text-xs font-medium text-[#194342]">{message}</p>}
        <button disabled={submitting} className="mt-5 rounded-lg bg-[#194342] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{submitting ? "در حال ذخیره..." : "ذخیره برنامه"}</button>
      </form>

      <section className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[#194342]">برنامه‌های ثبت‌شده</h2>
        {loading ? <p className="mt-5 text-xs text-[#667085]">در حال دریافت...</p> :
          <div className="mt-4 space-y-2">{items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#EEEAE3] p-4">
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-[11px] text-[#667085]">{item.description}</p></div>
              <button type="button" onClick={() => toggle(item)} className="rounded-lg border border-[#E7E2DA] px-3 py-2 text-[11px]">{item.isActive ? "غیرفعال کردن" : "فعال کردن"}</button>
            </div>
          ))}</div>}
      </section>
    </div>
  );
}