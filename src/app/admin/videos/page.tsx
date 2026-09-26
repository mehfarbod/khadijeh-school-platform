"use client";

import AdminLayout from "@/components/admin/AdminLayout";

import { FormEvent, useEffect, useState } from "react";

type Video = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  instructor: string;
  videoUrl: string;
  isActive: boolean;
};

const subjects = [
  ["math", "ریاضی"],
  ["physics", "فیزیک"],
  ["chemistry", "شیمی"],
  ["literature", "ادبیات"],
];

const grades = [
  ["grade-10", "پایه دهم"],
  ["grade-11", "پایه یازدهم"],
  ["grade-12", "پایه دوازدهم"],
];

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    subject: "math",
    grade: "grade-10",
    duration: "",
    instructor: "",
    isActive: true,
  });
  const [file, setFile] = useState<File | null>(null);

  async function loadVideos() {
    const response = await fetch("/api/videos?activeOnly=false", { cache: "no-store" });
    if (response.ok) setVideos(await response.json());
    setLoading(false);
  }

  useEffect(() => { loadVideos().catch(() => setLoading(false)); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("فایل ویدیو را انتخاب کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
      data.append("video", file);

      const response = await fetch("/api/videos", { method: "POST", body: data });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "افزودن ویدیو ناموفق بود.");
        return;
      }

      setForm({ title: "", subject: "math", grade: "grade-10", duration: "", instructor: "", isActive: true });
      setFile(null);
      const input = document.getElementById("video-file") as HTMLInputElement | null;
      if (input) input.value = "";
      setMessage("ویدیو با موفقیت اضافه شد.");
      await loadVideos();
    } catch {
      setMessage("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(video: Video) {
    const response = await fetch(`/api/videos?id=${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !video.isActive }),
    });
    if (response.ok) await loadVideos();
  }

  return (
    <AdminLayout>
      <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#194342]">ویدیوهای آموزشی</h1>
        <p className="mt-1 text-xs text-[#667085]">افزودن و مدیریت ویدیوهای آموزشی درسی</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[#194342]">افزودن ویدیو</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-medium text-[#475467]">عنوان ویدیو
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm outline-none focus:border-[#194342]" />
          </label>

          <label className="text-xs font-medium text-[#475467]">درس
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] bg-white px-3 py-2.5 text-sm">
              {subjects.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="text-xs font-medium text-[#475467]">پایه تحصیلی
            <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] bg-white px-3 py-2.5 text-sm">
              {grades.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="text-xs font-medium text-[#475467]">مدت ویدیو
            <input required placeholder="مثلاً ۱۸ دقیقه" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" />
          </label>

          <label className="text-xs font-medium text-[#475467]">مدرس
            <input required value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className="mt-1.5 w-full rounded-lg border border-[#E7E2DA] px-3 py-2.5 text-sm" />
          </label>

          <label className="text-xs font-medium text-[#475467]">فایل ویدیو
            <input id="video-file" required type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1.5 block w-full rounded-lg border border-[#E7E2DA] px-3 py-2 text-xs" />
            <span className="mt-1 block text-[10px] text-[#98A2B3]">حداکثر ۵۰۰ مگابایت</span>
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-xs text-[#475467]">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          انتشار در سایت
        </label>

        {message && <p className="mt-4 text-xs font-medium text-[#194342]">{message}</p>}

        <button disabled={submitting} className="mt-5 rounded-lg bg-[#194342] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
          {submitting ? "در حال آپلود..." : "افزودن ویدیو"}
        </button>
      </form>

      <section className="rounded-2xl border border-[#E7E2DA] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-[#194342]">ویدیوهای ثبت‌شده</h2>
        {loading ? <p className="mt-5 text-xs text-[#667085]">در حال دریافت...</p> : (
          <div className="mt-4 space-y-2">
            {videos.map((video) => (
              <div key={video.id} className="flex flex-col gap-3 rounded-xl border border-[#EEEAE3] p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1F2933]">{video.title}</p>
                  <p className="mt-1 text-[11px] text-[#667085]">{video.instructor} • {video.duration} • {video.grade}</p>
                </div>
                <button type="button" onClick={() => toggleActive(video)} className="rounded-lg border border-[#E7E2DA] px-3 py-2 text-[11px] text-[#475467]">
                  {video.isActive ? "غیرفعال کردن" : "فعال کردن"}
                </button>
              </div>
            ))}
            {!videos.length && <p className="py-8 text-center text-xs text-[#98A2B3]">هنوز ویدیویی ثبت نشده است.</p>}
          </div>
        )}
      </section>
      </div>
    </AdminLayout>
  );
}