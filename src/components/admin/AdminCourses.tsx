"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Edit3, Plus, Power, Trash2, X } from "lucide-react";
import JalaliDatePicker from "@/components/ui/JalaliDatePicker";
import { gregorianToJalali } from "@/lib/date/jalali";

type Course = {
  id: string; title: string; slug: string; description: string; fullDescription: string | null;
  coverImage: string | null; instructor: string | null; startDate: string | null; endDate: string | null;
  schedule: string | null; duration: string | null; capacity: number; price: number | null;
  status: "active" | "upcoming"; category: string; gradeLevel: string | null;
  registrationDeadline: string | null; isActive: boolean; currentRegistrations: number;
};

type Registration = {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  grade: string;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
};

type FormState = {
  title: string; description: string; fullDescription: string; coverImage: string; instructor: string;
  startDate: string; endDate: string; schedule: string; duration: string; capacity: string;
  price: string; status: "active" | "upcoming"; category: string; gradeLevel: string;
  registrationDeadline: string; isActive: boolean;
};

const emptyForm: FormState = {
  title: "", description: "", fullDescription: "", coverImage: "", instructor: "",
  startDate: "", endDate: "", schedule: "", duration: "", capacity: "20", price: "",
  status: "upcoming", category: "آموزشی", gradeLevel: "", registrationDeadline: "", isActive: true,
};

const statusLabel = (status: string) => status === "active" ? "در حال ثبت‌نام" : "به‌زودی";
const registrationLabels: Record<Registration["status"], string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
  CANCELLED: "لغو شده",
};
const registrationClasses: Record<Registration["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};
const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";
const toInputDate = (value: string | null) => value ? gregorianToJalali(value) : "";

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [registrations, setRegistrations] = useState<Registration[] | null>(null);
  const [registrationsError, setRegistrationsError] = useState("");

  const load = async () => {
    const response = await fetch("/api/courses?activeOnly=false", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "خطا در دریافت دوره‌ها");
    setCourses(data);
  };

  useEffect(() => { load().catch((e) => { console.error(e); setCourses([]); }); }, []);

  const openRegistrations = async (course: Course) => {
    setSelectedCourse(course);
    setRegistrations(null);
    setRegistrationsError("");

    try {
      const response = await fetch(`/api/course-registrations?courseId=${course.id}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "خطا در دریافت ثبت‌نام‌های دوره");
      }

      setRegistrations(data);
    } catch (e) {
      setRegistrations([]);
      setRegistrationsError(e instanceof Error ? e.message : "خطا در دریافت ثبت‌نام‌های دوره");
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setOpen(true); };
  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title, description: course.description, fullDescription: course.fullDescription || "",
      coverImage: course.coverImage || "", instructor: course.instructor || "", startDate: toInputDate(course.startDate),
      endDate: toInputDate(course.endDate), schedule: course.schedule || "", duration: course.duration || "",
      capacity: String(course.capacity), price: course.price == null ? "" : String(course.price),
      status: course.status, category: course.category, gradeLevel: course.gradeLevel || "",
      registrationDeadline: toInputDate(course.registrationDeadline), isActive: course.isActive,
    });
    setError(""); setOpen(true);
  };

  const update = (key: keyof FormState, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      setError("عنوان، توضیح کوتاه و دسته‌بندی الزامی است."); return;
    }
    setSaving(true); setError("");
    try {
      const response = await fetch(editing ? `/api/courses?id=${editing.id}` : "/api/courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          price: form.price ? Number(form.price) : null,
          coverImage: form.coverImage || null,
          fullDescription: form.fullDescription || null,
          instructor: form.instructor || null,
          startDate: form.startDate || null, endDate: form.endDate || null,
          schedule: form.schedule || null, duration: form.duration || null,
          gradeLevel: form.gradeLevel || null, registrationDeadline: form.registrationDeadline || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ذخیره دوره انجام نشد.");
      setOpen(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "خطا در ذخیره دوره."); }
    finally { setSaving(false); }
  };

  const toggle = async (course: Course) => {
    const response = await fetch(`/api/courses?id=${course.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !course.isActive }),
    });
    if (response.ok) await load();
  };

  const remove = async (course: Course) => {
    if (!window.confirm(`دوره «${course.title}» حذف/غیرفعال شود؟`)) return;
    const response = await fetch(`/api/courses?id=${course.id}`, { method: "DELETE" });
    if (response.ok) await load();
    else { const data = await response.json(); window.alert(data?.error || "عملیات انجام نشد."); }
  };

  const activeCount = useMemo(() => courses?.filter((c) => c.isActive).length ?? 0, [courses]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">دوره‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">ایجاد و مدیریت دوره‌هایی که مستقیماً در سایت اصلی نمایش داده می‌شوند.</p>
        </div>
        <button onClick={openCreate} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> افزودن دوره
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-4"><p className="text-xs text-muted-foreground">کل دوره‌ها</p><p className="mt-1 text-2xl font-bold">{courses?.length ?? "—"}</p></div>
        <div className="rounded-xl border border-border/60 bg-card p-4"><p className="text-xs text-muted-foreground">فعال در سایت</p><p className="mt-1 text-2xl font-bold">{courses ? activeCount : "—"}</p></div>
        <div className="rounded-xl border border-border/60 bg-card p-4"><p className="text-xs text-muted-foreground">ثبت‌نام‌های دوره‌ها</p><p className="mt-1 text-2xl font-bold">{courses?.reduce((s,c)=>s+c.currentRegistrations,0) ?? "—"}</p></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="border-b border-border/60 bg-muted/30">
              {["عنوان دوره","دسته‌بندی","وضعیت","ظرفیت","ثبت‌نام","نمایش","عملیات"].map((h)=><th key={h} className="px-4 py-3 text-right font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {!courses ? <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">در حال دریافت...</td></tr> :
              courses.length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-muted-foreground"><BookOpen className="mx-auto mb-2 h-8 w-8 opacity-30"/>هنوز دوره‌ای ثبت نشده.</td></tr> :
              courses.map((course)=><tr key={course.id} className="border-b border-border/30 last:border-0">
                
                <td className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => openRegistrations(course)}
                    className="text-right font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {course.title}
                  </button>
                </td>
                <td className="px-4 py-3">{course.category}</td>
                <td className="px-4 py-3">{statusLabel(course.status)}</td>
                <td className="px-4 py-3">{course.capacity}</td>
                <td className="px-4 py-3">{course.currentRegistrations}/{course.capacity}</td>
                <td className="px-4 py-3">{course.isActive ? "نمایش" : "مخفی"}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1">
                  <button title="ویرایش" onClick={()=>openEdit(course)} className="rounded-md p-2 hover:bg-muted"><Edit3 className="h-4 w-4"/></button>
                  <button title={course.isActive ? "مخفی کردن" : "فعال کردن"} onClick={()=>toggle(course)} className="rounded-md p-2 hover:bg-muted"><Power className="h-4 w-4"/></button>
                  <button title="حذف" onClick={()=>remove(course)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCourse && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelectedCourse(null)}}>
        <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">ثبت‌نام‌شده‌های «{selectedCourse.title}»</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {registrations ? `${registrations.length} ثبت‌نام` : "در حال دریافت..."} · ظرفیت {selectedCourse.capacity} نفر
              </p>
            </div>
            <button onClick={()=>setSelectedCourse(null)} className="rounded-md p-2 hover:bg-muted"><X className="h-5 w-5"/></button>
          </div>

          {registrationsError && <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{registrationsError}</div>}

          {registrations && registrations.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead><tr className="border-b border-border/60 bg-muted/30">
                    {["دانش‌آموز","پایه","وضعیت","توضیحات","تاریخ ثبت"].map((h)=><th key={h} className="px-4 py-3 text-right font-medium text-muted-foreground">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {registrations.map((item)=><tr key={item.id} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 font-medium">{item.studentFirstName} {item.studentLastName}</td>
                      <td className="px-4 py-3">{item.grade}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${registrationClasses[item.status]}`}>
                          {registrationLabels[item.status]}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-4 py-3 text-xs text-muted-foreground">{item.notes || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Intl.DateTimeFormat("fa-IR").format(new Date(item.createdAt))}</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          ) : registrations ? (
            <div className="rounded-xl border border-border/60 p-10 text-center text-sm text-muted-foreground">
              هنوز کسی برای این دوره ثبت‌نام نکرده است.
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 p-10 text-center text-sm text-muted-foreground">
              در حال دریافت ثبت‌نام‌ها...
            </div>
          )}
        </div>
      </div>}

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(e)=>{if(e.target===e.currentTarget)setOpen(false)}}>
        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">{editing ? "ویرایش دوره" : "ایجاد دوره جدید"}</h2><p className="mt-1 text-xs text-muted-foreground">عنوان این فرم همان عنوانی است که در سایت اصلی نمایش داده می‌شود.</p></div><button onClick={()=>setOpen(false)} className="rounded-md p-2 hover:bg-muted"><X className="h-5 w-5"/></button></div>
          {error && <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm">عنوان دوره<input className={inputClass} value={form.title} onChange={e=>update("title",e.target.value)} placeholder="مثلاً کلاس تقویتی ریاضی"/></label>
            <label className="sm:col-span-2 text-sm">توضیح کوتاه<textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" value={form.description} onChange={e=>update("description",e.target.value)}/></label>
            <label className="text-sm">دسته‌بندی<input className={inputClass} value={form.category} onChange={e=>update("category",e.target.value)} placeholder="آموزشی"/></label>
            <label className="text-sm">پایه<input className={inputClass} value={form.gradeLevel} onChange={e=>update("gradeLevel",e.target.value)} placeholder="دهم تا دوازدهم"/></label>
            <label className="text-sm">مدرس<input className={inputClass} value={form.instructor} onChange={e=>update("instructor",e.target.value)}/></label>
            <label className="text-sm">مدت دوره<input className={inputClass} value={form.duration} onChange={e=>update("duration",e.target.value)} placeholder="مثلاً ۱۲ جلسه"/></label>
            <label className="text-sm">زمان‌بندی<input className={inputClass} value={form.schedule} onChange={e=>update("schedule",e.target.value)} placeholder="شنبه‌ها، ساعت ۱۶"/></label>
            <label className="text-sm">ظرفیت<input type="number" min="1" className={inputClass} value={form.capacity} onChange={e=>update("capacity",e.target.value)}/></label>
            <label className="text-sm">هزینه (تومان)<input type="number" min="0" className={inputClass} value={form.price} onChange={e=>update("price",e.target.value)} placeholder="اختیاری"/></label>
            <label className="text-sm">وضعیت<select className={inputClass} value={form.status} onChange={e=>update("status",e.target.value as FormState["status"])}><option value="active">در حال ثبت‌نام</option><option value="upcoming">به‌زودی</option></select></label>
            <div className="text-sm">مهلت ثبت‌نام<JalaliDatePicker value={form.registrationDeadline} onChange={(value) => update("registrationDeadline", value)} placeholder="انتخاب تاریخ" className={inputClass} /></div>
            <div className="text-sm">تاریخ شروع<JalaliDatePicker value={form.startDate} onChange={(value) => update("startDate", value)} placeholder="انتخاب تاریخ" className={inputClass} /></div>
            <div className="text-sm">تاریخ پایان<JalaliDatePicker value={form.endDate} onChange={(value) => update("endDate", value)} placeholder="انتخاب تاریخ" className={inputClass} /></div>
            <label className="sm:col-span-2 text-sm">تصویر دوره (اختیاری)<input className={inputClass} value={form.coverImage} onChange={e=>update("coverImage",e.target.value)} placeholder="https://..."/></label>
            <label className="sm:col-span-2 text-sm">توضیحات کامل<textarea className="mt-1.5 min-h-32 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" value={form.fullDescription} onChange={e=>update("fullDescription",e.target.value)}/></label>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e=>update("isActive",e.target.checked)}/> نمایش دوره در سایت</label>
          </div>
          <div className="mt-6 flex justify-end gap-2"><button onClick={()=>setOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm">انصراف</button><button disabled={saving} onClick={save} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">{saving ? "در حال ذخیره..." : "ذخیره دوره"}</button></div>
        </div>
      </div>}
    </>
  );
}
