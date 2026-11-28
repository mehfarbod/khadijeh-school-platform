"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRADE_LABELS } from "@/lib/persian";

type RecordItem = {
  id: string; studentId: string; academicYearId: string;
  semester: "FIRST" | "SECOND"; isPublished: boolean;
  student: { firstName: string; lastName: string };
  academicYear: { title: string };
};

type Options = {
  years: { id: string; title: string; isCurrent: boolean }[];
  classes: { id: string; grade: string; name: string }[];
  students: {
    id: string; firstName: string; lastName: string;
    enrollments: { academicYearId: string; grade: string; classId: string | null }[];
  }[];
};

const gradeOptions = ["10", "11", "12"].map((value) => ({
  value,
  label: GRADE_LABELS[value].replace(/^پایه\s+/, ""),
}));

export default function AdminOutstandingStudents() {
  const [items, setItems] = useState<RecordItem[] | null>(null);
  const [options, setOptions] = useState<Options>({ years: [], classes: [], students: [] });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [grade, setGrade] = useState("");
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState("");
  const [semester, setSemester] = useState<"FIRST" | "SECOND">("FIRST");
  const [published, setPublished] = useState(false);

  const load = async () => {
    const [recordsResponse, optionsResponse] = await Promise.all([
      fetch("/api/outstanding-students?publishedOnly=false", { cache: "no-store" }),
      fetch("/api/outstanding-students/options", { cache: "no-store" }),
    ]);
    if (!recordsResponse.ok || !optionsResponse.ok) { toast.error("خطا در دریافت اطلاعات"); return; }
    setItems(await recordsResponse.json());
    const next: Options = await optionsResponse.json();
    setOptions(next);
    setYear((current) => current || next.years.find((item) => item.isCurrent)?.id || "");
  };

  useEffect(() => { void load(); }, []);

  const classes = useMemo(
    () => options.classes.filter((schoolClass) => schoolClass.grade === grade),
    [grade, options.classes]
  );

  const students = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fa");
    return options.students.filter((item) => {
      const enrollment = item.enrollments.find((entry) => entry.academicYearId === year);
      if (!enrollment || enrollment.grade !== grade) return false;
      if (classId && enrollment.classId !== classId) return false;
      return !query || `${item.firstName} ${item.lastName}`.toLocaleLowerCase("fa").includes(query);
    });
  }, [classId, grade, options.students, search, year]);

  const save = async () => {
    if (!editing && (!year || !grade || !classId || !student)) { toast.error("پایه، کلاس و دانش‌آموز را انتخاب کنید."); return; }
    const response = await fetch(editing ? `/api/outstanding-students/${editing}` : "/api/outstanding-students", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { semester, isPublished: published } : { studentId: student, academicYearId: year, semester, isPublished: published }),
    });
    const data = await response.json();
    if (!response.ok) { toast.error(data.error || "ذخیره انجام نشد"); return; }
    toast.success("ذخیره شد"); setOpen(false); setEditing(null); setStudent(""); await load();
  };

  const toggle = async (item: RecordItem) => {
    const response = await fetch(`/api/outstanding-students/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !item.isPublished }) });
    if (response.ok) await load(); else toast.error("تغییر وضعیت انجام نشد");
  };

  const remove = async (id: string) => {
    if (!confirm("این انتخاب حذف شود؟")) return;
    const response = await fetch(`/api/outstanding-students/${id}`, { method: "DELETE" });
    if (response.ok) await load(); else toast.error("حذف انجام نشد");
  };

  const openCreate = () => {
    setEditing(null); setGrade(""); setClassId(""); setSearch(""); setStudent(""); setSemester("FIRST"); setPublished(false); setOpen(true);
  };

  return <AdminLayout>
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-xl font-bold">دانش‌آموزان ممتاز</h1><p className="mt-1 text-sm text-muted-foreground">انتخاب ممتازهای نیم‌سال اول و دوم</p></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />افزودن</Button></div>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[650px] text-sm"><thead className="bg-muted/30"><tr>{["دانش‌آموز", "سال تحصیلی", "نیم‌سال", "وضعیت", "عملیات"].map((title) => <th key={title} className="px-4 py-3 text-right">{title}</th>)}</tr></thead><tbody>
      {items === null ? <tr><td colSpan={5} className="p-10 text-center">در حال دریافت...</td></tr> : items.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">موردی ثبت نشده است.</td></tr> : items.map((item) => <tr key={item.id} className="border-t"><td className="px-4 py-3 font-medium">{item.student.firstName} {item.student.lastName}</td><td className="px-4 py-3">{item.academicYear.title}</td><td className="px-4 py-3">{item.semester === "FIRST" ? "اول" : "دوم"}</td><td className="px-4 py-3"><button onClick={() => void toggle(item)} className="rounded-full border px-2.5 py-1 text-xs">{item.isPublished ? "منتشرشده" : "پیش‌نویس"}</button></td><td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => { setEditing(item.id); setYear(item.academicYearId); setStudent(item.studentId); setSemester(item.semester); setPublished(item.isPublished); setOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => void remove(item.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></td></tr>)}
    </tbody></table></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent dir="rtl" className="max-w-2xl"><DialogHeader><DialogTitle>{editing ? "ویرایش انتخاب" : "افزودن دانش‌آموز ممتاز"}</DialogTitle></DialogHeader><div className="space-y-4">
      <div><Label>سال تحصیلی</Label><select value={year} disabled className="mt-1 h-10 w-full rounded-md border bg-muted/30 px-3">{options.years.map((item) => <option key={item.id} value={item.id}>{item.title} — جاری</option>)}</select></div>
      {!editing && <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>پایه</Label><select value={grade} onChange={(event) => { setGrade(event.target.value); setClassId(""); setStudent(""); }} className="mt-1 h-10 w-full rounded-md border px-3"><option value="">انتخاب پایه</option>{gradeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        <div><Label>کلاس</Label><select value={classId} disabled={!grade} onChange={(event) => { setClassId(event.target.value); setStudent(""); }} className="mt-1 h-10 w-full rounded-md border px-3 disabled:opacity-60"><option value="">{grade ? "انتخاب کلاس" : "ابتدا پایه را انتخاب کنید"}</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div className="sm:col-span-2"><Label>جست‌وجوی نام</Label><div className="relative mt-1"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} disabled={!classId} className="pr-9" placeholder="نام یا نام خانوادگی" /></div></div>
        <div className="sm:col-span-2"><Label>دانش‌آموز</Label><select value={student} disabled={!classId} onChange={(event) => setStudent(event.target.value)} className="mt-1 h-10 w-full rounded-md border px-3 disabled:opacity-60"><option value="">انتخاب دانش‌آموز ({students.length} نتیجه)</option>{students.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select></div>
      </div>}
      <div><Label>نیم‌سال</Label><select value={semester} onChange={(event) => setSemester(event.target.value as "FIRST" | "SECOND")} className="mt-1 h-10 w-full rounded-md border px-3"><option value="FIRST">نیم‌سال اول</option><option value="SECOND">نیم‌سال دوم</option></select></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />انتشار در سایت</label>
    </div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button><Button onClick={() => void save()}>ذخیره</Button></DialogFooter></DialogContent></Dialog>
  </AdminLayout>;
}
