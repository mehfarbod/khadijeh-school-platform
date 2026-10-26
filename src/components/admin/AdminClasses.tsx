"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Power, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Year = { id: string; title: string; isCurrent: boolean };
type Teacher = { id: string; name: string | null; staff: { firstName: string; lastName: string; subject: string | null } | null };
type Assignment = { id: string; subject: string | null; teacher: Teacher };
type SchoolClass = { id: string; academicYearId: string; grade: string; name: string; isActive: boolean; academicYear: Year; _count: { enrollments: number; teacherAssignments: number }; teacherAssignments: Assignment[] };

const grades = [{ value: "10", label: "دهم" }, { value: "11", label: "یازدهم" }, { value: "12", label: "دوازدهم" }];
const label = (value: string) => grades.find((g) => g.value === value)?.label ?? value;

export default function AdminClasses() {
  const [years, setYears] = useState<Year[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [yearId, setYearId] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [name, setName] = useState("");
  const [formGrade, setFormGrade] = useState("10");
  const [assignmentClass, setAssignmentClass] = useState<SchoolClass | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [subject, setSubject] = useState("");

  const load = async () => {
    try {
      const [yearRes, staffRes] = await Promise.all([fetch("/api/academic-years"), fetch("/api/staff?activeOnly=true")]);
      const yearData = await yearRes.json(); const staffData = await staffRes.json();
      if (!yearRes.ok) throw new Error(yearData.error || "خطا در دریافت سال‌های تحصیلی");
      if (!staffRes.ok) throw new Error(staffData.error || "خطا در دریافت معلمان");
      setYears(yearData);
      const current = yearData.find((y: Year) => y.isCurrent) ?? yearData[0];
      setYearId(current?.id ?? "");
      setTeachers(staffData.filter((s: { user?: { role: string } | null }) => s.user?.role === "TEACHER").map((s: { user: Teacher; firstName: string; lastName: string; subject: string | null }) => ({ ...s.user, staff: { firstName: s.firstName, lastName: s.lastName, subject: s.subject } })));
    } catch (e) { toast.error(e instanceof Error ? e.message : "خطا در دریافت اطلاعات"); }
  };

  const loadClasses = async () => {
    if (!yearId) return;
    const qs = new URLSearchParams({ academicYearId: yearId, activeOnly: "false" });
    if (grade) qs.set("grade", grade);
    const res = await fetch(`/api/admin/classes?${qs}`); const data = await res.json();
    if (!res.ok) throw new Error(data.error || "خطا در دریافت کلاس‌ها");
    setClasses(data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  useEffect(() => { if (yearId) loadClasses().catch((e) => toast.error(e instanceof Error ? e.message : "خطا در دریافت کلاس‌ها")); }, [yearId, grade]);

  const saveClass = async () => {
    if (!yearId || !name.trim()) return toast.error("سال تحصیلی و نام کلاس الزامی است.");
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/classes/${editing.id}` : "/api/admin/classes", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { name: name.trim(), grade: formGrade } : { academicYearId: yearId, name: name.trim(), grade: formGrade }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "خطا در ذخیره کلاس");
      toast.success(editing ? "کلاس ویرایش شد." : "کلاس ایجاد شد."); setDialog(false); await loadClasses();
    } catch (e) { toast.error(e instanceof Error ? e.message : "خطا در ذخیره کلاس"); } finally { setSaving(false); }
  };

  const addTeacher = async () => {
    if (!assignmentClass || !teacherId) return toast.error("معلم را انتخاب کنید.");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/classes/${assignmentClass.id}/assignments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherId, subject: subject.trim() || null }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "خطا در تخصیص معلم");
      toast.success("معلم به کلاس اضافه شد."); setTeacherId(""); setSubject(""); await loadClasses();
      setAssignmentClass(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "خطا در تخصیص معلم"); } finally { setSaving(false); }
  };

  const removeTeacher = async (item: SchoolClass, assignmentId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/classes/${item.id}/assignments?assignmentId=${assignmentId}`, { method: "DELETE" });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "خطا در حذف تخصیص");
      toast.success("تخصیص حذف شد."); await loadClasses(); setAssignmentClass(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : "خطا در حذف تخصیص"); } finally { setSaving(false); }
  };

  const toggle = async (item: SchoolClass) => {
    const res = await fetch(`/api/admin/classes/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !item.isActive }) });
    const data = await res.json(); if (!res.ok) return toast.error(data.error || "خطا در تغییر وضعیت");
    await loadClasses();
  };

  if (loading) return <AdminLayout><div dir="rtl" className="py-16 text-center text-sm text-[#667085]">در حال بارگذاری مدیریت کلاس‌ها...</div></AdminLayout>;

  return <AdminLayout><div dir="rtl" className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-xl font-bold">مدیریت کلاس‌ها</h1><p className="mt-1 text-sm text-[#667085]">تعریف کلاس و تخصیص معلم به هر کلاس</p></div><Button onClick={() => { setEditing(null); setName(""); setFormGrade(grade || "10"); setDialog(true); }} className="gap-2 bg-[#194342] hover:bg-[#123635]"><Plus className="h-4 w-4" />کلاس جدید</Button></div>
    <div className="grid gap-3 rounded-2xl border border-[#E7E2DA] bg-white p-4 sm:grid-cols-2"><div><Label>سال تحصیلی</Label><select value={yearId} onChange={(e) => setYearId(e.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm">{years.map((y) => <option key={y.id} value={y.id}>{y.title}{y.isCurrent ? " (جاری)" : ""}</option>)}</select></div><div><Label>پایه</Label><select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">همه پایه‌ها</option>{grades.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div></div>
    {classes.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-sm text-[#667085]">برای این فیلتر کلاسی تعریف نشده است.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{classes.map((item) => <div key={item.id} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><h2 className="font-bold">{item.name}</h2><p className="mt-1 text-xs text-[#667085]">{label(item.grade)} · {item.academicYear.title}</p></div><div className="flex gap-1"><button onClick={() => { setEditing(item); setName(item.name); setFormGrade(item.grade); setDialog(true); }} className="rounded-lg p-2 hover:bg-[#F1F5E8]" aria-label="ویرایش"><Pencil className="h-4 w-4" /></button><button onClick={() => toggle(item)} className="rounded-lg p-2 hover:bg-[#F1F5E8]" aria-label="تغییر وضعیت"><Power className="h-4 w-4" /></button></div></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#FAF8F5] p-3 text-xs">دانش‌آموز<strong className="mt-1 block text-base">{item._count.enrollments}</strong></div><div className="rounded-xl bg-[#FAF8F5] p-3 text-xs">معلم<strong className="mt-1 block text-base">{item._count.teacherAssignments}</strong></div></div><div className="mt-4 space-y-2">{item.teacherAssignments.map((a) => <div key={a.id} className="flex items-center rounded-xl border px-3 py-2 text-xs"><span className="min-w-0 flex-1 truncate">{a.teacher.staff ? `${a.teacher.staff.firstName} ${a.teacher.staff.lastName}` : a.teacher.name} · {a.subject || a.teacher.staff?.subject || "بدون درس"}</span><button onClick={() => removeTeacher(item, a.id)} disabled={saving} className="p-1 text-[#B42318]" aria-label="حذف معلم"><X className="h-4 w-4" /></button></div>)}{item.teacherAssignments.length === 0 && <p className="text-xs text-[#98A2B3]">هنوز معلمی تخصیص داده نشده.</p>}</div><Button variant="outline" onClick={() => { setAssignmentClass(item); setTeacherId(""); setSubject(""); }} className="mt-4 w-full gap-2"><UserPlus className="h-4 w-4" />تخصیص معلم</Button></div>)}</div>}
  </div>

  <Dialog open={dialog} onOpenChange={setDialog}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{editing ? "ویرایش کلاس" : "کلاس جدید"}</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>پایه</Label><select value={formGrade} onChange={(e) => setFormGrade(e.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm">{grades.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div><div><Label>نام کلاس</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً ۱۰۱" className="mt-2" /></div></div><DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>انصراف</Button><Button disabled={saving} onClick={saveClass} className="bg-[#194342]">ذخیره</Button></DialogFooter></DialogContent></Dialog>

  <Dialog open={!!assignmentClass} onOpenChange={(open) => !open && setAssignmentClass(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>تخصیص معلم به {assignmentClass?.name}</DialogTitle></DialogHeader><div className="space-y-4"><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="h-10 w-full rounded-md border px-3 text-sm"><option value="">انتخاب معلم</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.staff ? `${t.staff.firstName} ${t.staff.lastName}` : t.name}</option>)}</select><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="درس (اختیاری)" /><Button disabled={saving} onClick={addTeacher} className="w-full bg-[#194342]">افزودن معلم</Button></div></DialogContent></Dialog>
  </AdminLayout>;
}
