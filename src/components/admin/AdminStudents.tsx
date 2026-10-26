"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import JalaliDatePicker from "@/components/ui/JalaliDatePicker";
import { gregorianToJalali } from "@/lib/date/jalali";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Users, GraduationCap, School, UserRound, MapPin } from "lucide-react";
import { toast } from "sonner";

interface AcademicYear { id: string; title: string; isCurrent: boolean; }
interface SchoolClass { id: string; academicYearId: string; grade: string; name: string; isActive: boolean; }
interface Enrollment { id: string; academicYearId: string; grade: string; classId: string | null; className: string | null; academicYear: AcademicYear; class?: SchoolClass | null; }
interface Student {
  id: string; firstName: string; lastName: string; nationalId: string | null; birthCertificateSerial: string | null; mobile: string | null; birthday: string | null;
  fatherFirstName: string | null; fatherLastName: string | null; fatherNationalId: string | null; fatherJob: string | null; fatherEducation: string | null; fatherMobile: string | null;
  motherFirstName: string | null; motherLastName: string | null; motherNationalId: string | null; motherJob: string | null; motherEducation: string | null; motherMobile: string | null;
  address: string | null; landline: string | null; description: string | null; email: string | null; isActive: boolean; enrollments: Enrollment[];
}
interface StudentForm {
  firstName: string; lastName: string; nationalId: string; birthCertificateSerial: string; mobile: string; birthday: string;
  fatherFirstName: string; fatherLastName: string; fatherNationalId: string; fatherJob: string; fatherEducation: string; fatherMobile: string;
  motherFirstName: string; motherLastName: string; motherNationalId: string; motherJob: string; motherEducation: string; motherMobile: string;
  address: string; landline: string; description: string; academicYearId: string; grade: string; classId: string;
}

const grades = [{ value: "10", label: "دهم" }, { value: "11", label: "یازدهم" }, { value: "12", label: "دوازدهم" }];
const gradeLabels: Record<string, string> = { "10": "دهم", "11": "یازدهم", "12": "دوازدهم", دهم: "دهم", یازدهم: "یازدهم", دوازدهم: "دوازدهم" };
const emptyForm: StudentForm = {
  firstName: "", lastName: "", nationalId: "", birthCertificateSerial: "", mobile: "", birthday: "",
  fatherFirstName: "", fatherLastName: "", fatherNationalId: "", fatherJob: "", fatherEducation: "", fatherMobile: "",
  motherFirstName: "", motherLastName: "", motherNationalId: "", motherJob: "", motherEducation: "", motherMobile: "",
  address: "", landline: "", description: "", academicYearId: "", grade: "10", classId: "",
};

export default function AdminStudents() {
  const searchParams = useSearchParams();
  const showInactive = searchParams?.get("status") === "inactive";
  const [students, setStudents] = useState<Student[] | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAcademicYears = async () => {
    try {
      const response = await fetch("/api/academic-years"); const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در دریافت سال‌های تحصیلی");
      setAcademicYears(data);
      const current = data.find((year: AcademicYear) => year.isCurrent);
      setSelectedYearId(current?.id || data[0]?.id || "");
    } catch (error) { toast.error(error instanceof Error ? error.message : "خطا در دریافت سال‌های تحصیلی"); }
  };

  const loadClasses = async (yearId = selectedYearId, grade = selectedGrade) => {
    if (!yearId) { setClasses([]); return; }
    try {
      const params = new URLSearchParams({ academicYearId: yearId, activeOnly: "true" });
      if (grade) params.set("grade", grade);
      const response = await fetch(`/api/admin/classes?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در دریافت کلاس‌ها");
      setClasses(data);
    } catch (error) { setClasses([]); toast.error(error instanceof Error ? error.message : "خطا در دریافت کلاس‌ها"); }
  };

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams(showInactive ? { inactiveOnly: "true" } : { activeOnly: "true" });
      if (selectedYearId) params.set("academicYearId", selectedYearId);
      if (selectedGrade) params.set("grade", selectedGrade);
      if (selectedClassId) params.set("classId", selectedClassId);
      const response = await fetch(`/api/students?${params.toString()}`); const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در دریافت اطلاعات دانش‌آموزان");
      setStudents(data);
    } catch (error) { setStudents([]); toast.error(error instanceof Error ? error.message : "خطا در دریافت اطلاعات دانش‌آموزان"); }
  };

  useEffect(() => { void loadAcademicYears(); }, []);
  useEffect(() => { if (selectedYearId) { void loadClasses(); void loadStudents(); } }, [selectedYearId, selectedGrade, selectedClassId, academicYears.length, showInactive]);

  const selectedYear = academicYears.find((year) => year.id === selectedYearId);
  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const formClasses = useMemo(() => classes.filter((item) => item.academicYearId === form.academicYearId && item.grade === form.grade && item.isActive), [classes, form.academicYearId, form.grade]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) => `${student.firstName} ${student.lastName}`.toLowerCase().includes(q) || student.nationalId?.includes(q) || student.mobile?.includes(q));
  }, [students, search]);

  const classSummary = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    classes.forEach((item) => map.set(item.id, { id: item.id, name: item.name, count: 0 }));
    students?.forEach((student) => student.enrollments.forEach((enrollment) => {
      if (enrollment.academicYearId === selectedYearId && enrollment.classId && map.has(enrollment.classId)) map.get(enrollment.classId)!.count++;
    }));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fa"));
  }, [classes, students, selectedYearId]);

  const getCurrentEnrollment = (student: Student) => student.enrollments.find((enrollment) => enrollment.academicYearId === selectedYearId);
  const updateForm = <K extends keyof StudentForm>(key: K, value: StudentForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditId(null);
    const yearId = selectedYearId || academicYears[0]?.id || "";
    const grade = selectedGrade || "10";
    setForm({ ...emptyForm, academicYearId: yearId, grade, classId: selectedClassId || "" });
    if (yearId) void loadClasses(yearId, grade);
    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    const enrollment = getCurrentEnrollment(student);
    const academicYearId = enrollment?.academicYearId || selectedYearId || academicYears[0]?.id || "";
    const grade = enrollment?.grade || selectedGrade || "10";
    const classId = enrollment?.classId || classes.find((item) => item.academicYearId === academicYearId && item.grade === grade && item.name === enrollment?.className)?.id || "";
    setEditId(student.id);
    setForm({
      firstName: student.firstName, lastName: student.lastName, nationalId: student.nationalId ?? "", birthCertificateSerial: student.birthCertificateSerial ?? "", mobile: student.mobile ?? "", birthday: student.birthday ? gregorianToJalali(student.birthday) : "",
      fatherFirstName: student.fatherFirstName ?? "", fatherLastName: student.fatherLastName ?? "", fatherNationalId: student.fatherNationalId ?? "", fatherJob: student.fatherJob ?? "", fatherEducation: student.fatherEducation ?? "", fatherMobile: student.fatherMobile ?? "",
      motherFirstName: student.motherFirstName ?? "", motherLastName: student.motherLastName ?? "", motherNationalId: student.motherNationalId ?? "", motherJob: student.motherJob ?? "", motherEducation: student.motherEducation ?? "", motherMobile: student.motherMobile ?? "",
      address: student.address ?? "", landline: student.landline ?? "", description: student.description ?? "", academicYearId, grade, classId,
    });
    void loadClasses(academicYearId, grade); setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return toast.error("نام و نام خانوادگی الزامی است.");
    if (!form.academicYearId) return toast.error("انتخاب سال تحصیلی الزامی است.");
    if (!form.grade) return toast.error("انتخاب پایه تحصیلی الزامی است.");
    if (!form.classId) return toast.error("انتخاب کلاس الزامی است.");
    const nationalId = form.nationalId.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\s/g, "");
    if (nationalId && !/^\d{10}$/.test(nationalId)) return toast.error("کد ملی باید ۱۰ رقم باشد.");
    const mobile = form.mobile.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[\s-]/g, "");
    if (mobile && !/^09\d{9}$/.test(mobile)) return toast.error("شماره تلفن همراه معتبر نیست.");
    try {
      setSaving(true);
      const selected = formClasses.find((item) => item.id === form.classId);
      const payload = {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(), nationalId: nationalId || null, birthCertificateSerial: form.birthCertificateSerial.trim() || null, mobile: mobile || null, birthday: form.birthday.trim() || null,
        fatherFirstName: form.fatherFirstName.trim() || null, fatherLastName: form.fatherLastName.trim() || null, fatherNationalId: form.fatherNationalId.trim() || null, fatherJob: form.fatherJob.trim() || null, fatherEducation: form.fatherEducation.trim() || null, fatherMobile: form.fatherMobile.trim() || null,
        motherFirstName: form.motherFirstName.trim() || null, motherLastName: form.motherLastName.trim() || null, motherNationalId: form.motherNationalId.trim() || null, motherJob: form.motherJob.trim() || null, motherEducation: form.motherEducation.trim() || null, motherMobile: form.motherMobile.trim() || null,
        address: form.address.trim() || null, landline: form.landline.trim() || null, description: form.description.trim() || null,
        academicYearId: form.academicYearId, grade: form.grade, classId: form.classId, className: selected?.name || null, ...(editId ? {} : { isActive: true }),
      };
      const response = await fetch(editId ? `/api/students/${editId}` : "/api/students", { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "خطا در ذخیره‌سازی اطلاعات");
      toast.success(editId ? "اطلاعات دانش‌آموز با موفقیت ویرایش شد." : "دانش‌آموز با موفقیت اضافه شد."); setDialogOpen(false); await loadStudents();
    } catch (error) { toast.error(error instanceof Error ? error.message : "خطا در ذخیره‌سازی اطلاعات"); } finally { setSaving(false); }
  };

  const handleReactivate = async (studentId: string) => {
    try { const response = await fetch(`/api/students/${studentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: true }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "خطا در فعال‌سازی دانش‌آموز"); toast.success("دانش‌آموز دوباره فعال شد."); await loadStudents(); } catch (error) { toast.error(error instanceof Error ? error.message : "خطا در فعال‌سازی دانش‌آموز"); }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try { const response = await fetch(`/api/students/${deleteId}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "خطا در غیرفعال‌سازی دانش‌آموز"); setDeleteId(null); toast.success("دانش‌آموز غیرفعال شد."); await loadStudents(); } catch (error) { toast.error(error instanceof Error ? error.message : "خطا در غیرفعال‌سازی دانش‌آموز"); }
  };

  return <AdminLayout>
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-xl font-bold text-foreground">{showInactive ? "دانش‌آموزان غیرفعال" : "دانش‌آموزان"}</h1><p className="mt-1 text-sm text-muted-foreground">{showInactive ? "آرشیو دانش‌آموزانی که از فهرست فعال خارج شده‌اند" : "مدیریت دانش‌آموزان بر اساس سال تحصیلی، پایه و کلاس"}</p></div>{!showInactive && <Button onClick={openCreate} size="sm" className="gap-2" disabled={academicYears.length === 0}><Plus className="h-4 w-4" />افزودن دانش‌آموز</Button>}</div>
    <div className="mb-5 rounded-xl border border-border/60 bg-card p-4"><div className="flex flex-wrap items-end gap-4"><div className="min-w-[220px]"><Label className="text-xs">سال تحصیلی</Label><select value={selectedYearId} onChange={(e) => { setSelectedYearId(e.target.value); setSelectedGrade(""); setSelectedClassId(""); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">سالی ثبت نشده است</option>{academicYears.map((year) => <option key={year.id} value={year.id}>{year.title}{year.isCurrent ? " — جاری" : ""}</option>)}</select></div><div className="min-w-[180px]"><Label className="text-xs">پایه</Label><select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedClassId(""); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">همه پایه‌ها</option>{grades.map((grade) => <option key={grade.value} value={grade.value}>{grade.label}</option>)}</select></div><div className="min-w-[180px]"><Label className="text-xs">کلاس</Label><select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">همه کلاس‌ها</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div></div>
    {!selectedClassId && classSummary.length > 0 && <div className="mb-5"><div className="mb-3 flex items-center gap-2"><School className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold">کلاس‌ها</h2>{selectedGrade && <span className="text-xs text-muted-foreground">{gradeLabels[selectedGrade] ?? selectedGrade}</span>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{classSummary.map((item) => <button key={item.id} type="button" onClick={() => setSelectedClassId(item.id)} className="group rounded-xl border border-border/60 bg-card p-4 text-right transition hover:border-primary/40 hover:bg-muted/30"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">کلاس {item.name}</p><p className="mt-1 text-xs text-muted-foreground">{selectedYear?.title}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><Users className="h-4 w-4" /></div></div><div className="mt-4 text-2xl font-bold">{item.count}</div><p className="text-xs text-muted-foreground">دانش‌آموز</p></button>)}</div></div>}
    <div className="mb-4 flex flex-wrap items-center gap-2">{selectedYear && <span className="rounded-full bg-muted px-3 py-1 text-xs">{selectedYear.title}</span>}{selectedGrade && <span className="rounded-full bg-muted px-3 py-1 text-xs">{gradeLabels[selectedGrade] ?? selectedGrade}</span>}{selectedClassId && <button type="button" onClick={() => setSelectedClassId("")} className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/70">کلاس {selectedClass?.name || ""} ×</button>}</div>
    <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="جستجوی نام، کد ملی یا موبایل..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
    <div className="overflow-hidden rounded-xl border border-border/60"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border/60 bg-muted/30"><th className="px-4 py-3 text-right font-medium text-muted-foreground">نام و نام خانوادگی</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">کد ملی</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">کلاس</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">وضعیت</th><th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th></tr></thead><tbody>{!students ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="border-b border-border/30">{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-muted" /></td>)}</tr>) : filteredStudents.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center"><GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-3 text-sm text-muted-foreground">دانش‌آموزی در این محدوده یافت نشد.</p></td></tr> : filteredStudents.map((student) => { const enrollment = getCurrentEnrollment(student); return <tr key={student.id} className="border-b border-border/30 hover:bg-muted/20"><td className="px-4 py-3 font-medium"><button type="button" onClick={() => setSelectedStudent(student)} className="text-right hover:text-primary hover:underline">{student.firstName} {student.lastName}</button></td><td className="px-4 py-3 text-muted-foreground">{student.nationalId || "—"}</td><td className="px-4 py-3">{enrollment ? (gradeLabels[enrollment.grade] ?? enrollment.grade) : "—"}</td><td className="px-4 py-3">{enrollment?.class?.name || enrollment?.className || "—"}</td><td className="px-4 py-3">{student.isActive ? <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">فعال</span> : <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">غیرفعال</span>}</td><td className="px-4 py-3"><div className="flex items-center gap-1">{showInactive ? <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleReactivate(student.id)}><UserRound className="h-3.5 w-3.5" />فعال‌سازی</Button> : <><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(student)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(student.id)}><Trash2 className="h-3.5 w-3.5" /></Button></>}</div></td></tr>; })}</tbody></table></div></div>

    <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl"><DialogHeader><DialogTitle>جزئیات دانش‌آموز</DialogTitle></DialogHeader>{selectedStudent && (() => { const e = getCurrentEnrollment(selectedStudent); return <div className="grid gap-5 py-2 text-sm sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">نام و نام خانوادگی</p><p className="mt-1 font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p></div><div><p className="text-xs text-muted-foreground">کد ملی</p><p className="mt-1">{selectedStudent.nationalId || "—"}</p></div><div><p className="text-xs text-muted-foreground">شماره تلفن همراه</p><p className="mt-1">{selectedStudent.mobile || "—"}</p></div><div><p className="text-xs text-muted-foreground">تاریخ تولد</p><p className="mt-1">{selectedStudent.birthday || "—"}</p></div><div><p className="text-xs text-muted-foreground">پایه / کلاس</p><p className="mt-1">{e ? `${gradeLabels[e.grade] ?? e.grade} / ${e.class?.name || e.className || "بدون کلاس"}` : "—"}</p></div><div><p className="text-xs text-muted-foreground">سال تحصیلی</p><p className="mt-1">{e?.academicYear.title || "—"}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">پدر</p><p className="mt-1">{[selectedStudent.fatherFirstName, selectedStudent.fatherLastName].filter(Boolean).join(" ") || "—"} · {selectedStudent.fatherMobile || "بدون شماره"}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">مادر</p><p className="mt-1">{[selectedStudent.motherFirstName, selectedStudent.motherLastName].filter(Boolean).join(" ") || "—"} · {selectedStudent.motherMobile || "بدون شماره"}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">آدرس</p><p className="mt-1 leading-7">{selectedStudent.address || "—"}</p></div><div className="sm:col-span-2"><p className="text-xs text-muted-foreground">توضیحات</p><p className="mt-1 whitespace-pre-wrap leading-7">{selectedStudent.description || "—"}</p></div></div>; })()}</DialogContent></Dialog>

    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open); }}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" dir="rtl"><DialogHeader><DialogTitle>{editId ? "ویرایش اطلاعات دانش‌آموز" : "افزودن دانش‌آموز"}</DialogTitle></DialogHeader><div className="space-y-6 py-2">
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4"><div className="mb-4 flex items-center gap-2"><UserRound className="h-5 w-5 text-muted-foreground" /><div><h3 className="font-semibold">اطلاعات دانش‌آموز</h3><p className="text-xs text-muted-foreground">مشخصات فردی و اطلاعات شناسنامه‌ای</p></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{([ ["نام","firstName","نام دانش‌آموز"],["نام خانوادگی","lastName","نام خانوادگی"],["کد ملی","nationalId","۱۰ رقم"],["سری شناسنامه","birthCertificateSerial","سری شناسنامه"],["شماره تلفن همراه","mobile","0912..."] ] as const).map(([labelText,key,placeholder]) => <div key={key}><Label className="text-xs">{labelText}</Label><Input value={form[key]} onChange={(e) => updateForm(key,e.target.value)} className="mt-1" placeholder={placeholder} disabled={saving} /></div>)}<div><Label className="text-xs">تاریخ تولد</Label><div className="mt-1"><JalaliDatePicker value={form.birthday} onChange={(value) => updateForm("birthday",value)} placeholder="تاریخ تولد" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={saving} /></div></div></div></section>
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4"><h3 className="mb-4 font-semibold">اطلاعات پدر</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{([ ["نام پدر","fatherFirstName"],["نام خانوادگی پدر","fatherLastName"],["کد ملی پدر","fatherNationalId"],["شغل پدر","fatherJob"],["تحصیلات پدر","fatherEducation"],["شماره تلفن همراه پدر","fatherMobile"] ] as const).map(([labelText,key]) => <div key={key}><Label className="text-xs">{labelText}</Label><Input value={form[key]} onChange={(e) => updateForm(key,e.target.value)} className="mt-1" disabled={saving} /></div>)}</div></section>
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4"><h3 className="mb-4 font-semibold">اطلاعات مادر</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{([ ["نام مادر","motherFirstName"],["نام خانوادگی مادر","motherLastName"],["کد ملی مادر","motherNationalId"],["شغل مادر","motherJob"],["تحصیلات مادر","motherEducation"],["شماره تلفن همراه مادر","motherMobile"] ] as const).map(([labelText,key]) => <div key={key}><Label className="text-xs">{labelText}</Label><Input value={form[key]} onChange={(e) => updateForm(key,e.target.value)} className="mt-1" disabled={saving} /></div>)}</div></section>
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4"><div className="mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-muted-foreground" /><h3 className="font-semibold">اطلاعات تماس و آدرس</h3></div><div className="space-y-4"><div><Label className="text-xs">آدرس</Label><textarea value={form.address} onChange={(e) => updateForm("address",e.target.value)} rows={3} className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={saving} /></div><div><Label className="text-xs">تلفن ثابت</Label><Input value={form.landline} onChange={(e) => updateForm("landline",e.target.value)} className="mt-1" disabled={saving} /></div><div><Label className="text-xs">توضیحات</Label><textarea value={form.description} onChange={(e) => updateForm("description",e.target.value)} rows={4} className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={saving} /></div></div></section>
      <section className="rounded-xl border border-border/60 bg-muted/20 p-4"><div className="mb-4 flex items-center gap-2"><School className="h-5 w-5 text-muted-foreground" /><div><h3 className="font-semibold">اطلاعات تحصیلی</h3><p className="text-xs text-muted-foreground">سال تحصیلی، پایه و کلاس</p></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><div><Label className="text-xs">سال تحصیلی</Label><select value={form.academicYearId} onChange={(e) => { const value = e.target.value; updateForm("academicYearId",value); updateForm("classId",""); void loadClasses(value,form.grade); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={saving}><option value="">انتخاب سال تحصیلی</option>{academicYears.map((year) => <option key={year.id} value={year.id}>{year.title}{year.isCurrent ? " — جاری" : ""}</option>)}</select></div><div><Label className="text-xs">پایه</Label><select value={form.grade} onChange={(e) => { const value = e.target.value; updateForm("grade",value); updateForm("classId",""); void loadClasses(form.academicYearId,value); }} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={saving}><option value="">انتخاب پایه</option>{grades.map((grade) => <option key={grade.value} value={grade.value}>{grade.label}</option>)}</select></div><div><Label className="text-xs">کلاس</Label><select value={form.classId} onChange={(e) => updateForm("classId",e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" disabled={saving || !form.academicYearId || !form.grade}><option value="">انتخاب کلاس</option>{formClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{form.academicYearId && form.grade && formClasses.length === 0 && <p className="mt-1 text-xs text-muted-foreground">برای این سال و پایه هنوز کلاسی تعریف نشده است.</p>}</div></div></section>
    </div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>انصراف</Button><Button type="button" onClick={handleSubmit} disabled={saving || !form.firstName.trim() || !form.lastName.trim()}>{saving ? "در حال ذخیره..." : editId ? "ذخیره تغییرات" : "افزودن دانش‌آموز"}</Button></DialogFooter></DialogContent></Dialog>

    <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>غیرفعال‌سازی دانش‌آموز</AlertDialogTitle><AlertDialogDescription>این دانش‌آموز از لیست فعال خارج می‌شود، اما اطلاعات و سوابق او حذف نخواهد شد.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">غیرفعال‌سازی</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </AdminLayout>;
}
