"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, RefreshCw, Trash2 } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Year = { id: string; title: string; isCurrent: boolean };
type Assignment = { id: string; subject: string | null };
type SchoolClass = {
  id: string;
  academicYearId: string;
  grade: string;
  name: string;
  teacherAssignments: Assignment[];
};
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  enrollments: { grade: string; className: string | null }[];
};
type Grade = {
  id: string;
  studentId: string;
  subject: string;
  term: string;
  score: string;
  description: string | null;
};
type Assessment = {
  id: string;
  studentId: string;
  subject: string;
  title: string;
  assessmentDate: string | null;
  score: string;
  description: string | null;
};

const termOptions = [
  "مستمر نوبت اول",
  "نوبت اول",
  "مستمر نوبت دوم",
  "نوبت دوم",
];

const gradeLabel = (value: string) => ({ "10": "دهم", "11": "یازدهم", "12": "دوازدهم" }[value] ?? value);

export default function TeacherGrades() {
  const [years, setYears] = useState<Year[]>([]);
  const [yearId, setYearId] = useState("");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("نوبت اول");
  const [score, setScore] = useState("");
  const [description, setDescription] = useState("");
  const [assessmentSubject, setAssessmentSubject] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentDate, setAssessmentDate] = useState<DateObject | null>(null);
  const [assessmentScore, setAssessmentScore] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedClass = classes.find((item) => item.id === classId);
  const assignedSubjects = useMemo(
    () => Array.from(new Set(selectedClass?.teacherAssignments.map((item) => item.subject?.trim()).filter(Boolean) as string[] ?? [])),
    [selectedClass],
  );
  const hasClassWideAssignment = Boolean(selectedClass?.teacherAssignments.some((item) => !item.subject?.trim()));
  const canChooseSubject = hasClassWideAssignment || assignedSubjects.length > 0;

  const loadYears = async () => {
    const response = await fetch("/api/admin/grades", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "خطا در دریافت سال‌های تحصیلی.");
    setYears(data.academicYears ?? []);
    if (!yearId && data.academicYears?.[0]) setYearId(data.academicYears[0].id);
  };

  const loadClasses = async (academicYearId: string) => {
    if (!academicYearId) {
      setClasses([]);
      return;
    }
    const response = await fetch(`/api/admin/classes?academicYearId=${encodeURIComponent(academicYearId)}&activeOnly=true`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "خطا در دریافت کلاس‌های شما.");
    setClasses(data);
  };

  const loadStudents = async () => {
    if (!yearId || !classId) {
      setStudents([]);
      return;
    }
    const className = selectedClass?.name;
    const query = new URLSearchParams({ academicYearId: yearId });
    if (className) query.set("className", className);
    const response = await fetch(`/api/admin/grades?${query.toString()}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "خطا در دریافت دانش‌آموزان کلاس.");
    setStudents(data.students ?? []);
  };

  const loadStudentData = async () => {
    if (!yearId || !studentId) {
      setGrades([]);
      setAssessments([]);
      return;
    }
    const [gradesResponse, assessmentsResponse] = await Promise.all([
      fetch(`/api/admin/grades?academicYearId=${encodeURIComponent(yearId)}&studentId=${encodeURIComponent(studentId)}`, { cache: "no-store" }),
      fetch(`/api/admin/assessments?academicYearId=${encodeURIComponent(yearId)}&studentId=${encodeURIComponent(studentId)}`, { cache: "no-store" }),
    ]);
    const gradesData = await gradesResponse.json();
    const assessmentsData = await assessmentsResponse.json();
    if (!gradesResponse.ok) throw new Error(gradesData?.error || "خطا در دریافت نمرات.");
    if (!assessmentsResponse.ok) throw new Error(assessmentsData?.error || "خطا در دریافت ارزیابی‌ها.");
    setGrades(gradesData.grades ?? []);
    setAssessments(assessmentsData.assessments ?? []);
  };

  useEffect(() => {
    setLoading(true);
    loadYears().catch((e) => setError(e instanceof Error ? e.message : "خطا در دریافت اطلاعات."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setError("");
    setClassId("");
    setStudentId("");
    setStudents([]);
    loadClasses(yearId).catch((e) => setError(e instanceof Error ? e.message : "خطا در دریافت کلاس‌ها."));
  }, [yearId]);

  useEffect(() => {
    setStudentId("");
    setGrades([]);
    setAssessments([]);
    if (!selectedClass) return;
    const firstSubject = assignedSubjects[0] ?? "";
    setSubject(firstSubject);
    setAssessmentSubject(firstSubject);
    loadStudents().catch((e) => setError(e instanceof Error ? e.message : "خطا در دریافت دانش‌آموزان."));
  }, [classId]);

  useEffect(() => {
    loadStudentData().catch((e) => setError(e instanceof Error ? e.message : "خطا در دریافت اطلاعات دانش‌آموز."));
  }, [studentId, yearId]);

  const saveGrade = async () => {
    setError("");
    setSuccess("");
    const numericScore = Number(score);
    if (!yearId || !studentId || !subject.trim() || !term || !Number.isFinite(numericScore) || numericScore < 0 || numericScore > 20) {
      setError("کلاس، دانش‌آموز، درس، نوبت و نمره بین ۰ تا ۲۰ الزامی است.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, academicYearId: yearId, subject: subject.trim(), term, score: numericScore, description: description || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ثبت نمره انجام نشد.");
      setSuccess(editingId ? "نمره با موفقیت ویرایش شد." : "نمره با موفقیت ثبت شد.");
      setEditingId(null);
      setScore("");
      setDescription("");
      await loadStudentData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نمره انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  const saveAssessment = async () => {
    setError("");
    setSuccess("");
    const numericScore = Number(assessmentScore);
    if (!yearId || !studentId || !assessmentSubject.trim() || !assessmentTitle.trim() || !Number.isFinite(numericScore) || numericScore < 0 || numericScore > 20) {
      setError("کلاس، دانش‌آموز، درس، عنوان ارزیابی و نمره بین ۰ تا ۲۰ الزامی است.");
      return;
    }
    setAssessmentSaving(true);
    try {
      const response = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, academicYearId: yearId, subject: assessmentSubject.trim(), type: "هفتگی", title: assessmentTitle.trim(), assessmentDate: assessmentDate ? assessmentDate.toDate().toISOString() : null, score: numericScore, description: assessmentDescription || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ثبت ارزیابی انجام نشد.");
      setSuccess("ارزیابی هفتگی با موفقیت ثبت شد.");
      setAssessmentTitle("");
      setAssessmentDate(null);
      setAssessmentScore("");
      setAssessmentDescription("");
      await loadStudentData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت ارزیابی انجام نشد.");
    } finally {
      setAssessmentSaving(false);
    }
  };

  const editGrade = (item: Grade) => {
    setEditingId(item.id);
    setSubject(item.subject);
    setTerm(item.term);
    setScore(item.score);
    setDescription(item.description || "");
    setError("");
    setSuccess("");
  };

  const removeGrade = async (id: string) => {
    if (!window.confirm("این نمره حذف شود؟")) return;
    const response = await fetch(`/api/admin/grades?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error || "حذف نمره انجام نشد.");
      return;
    }
    setSuccess("نمره حذف شد.");
    if (editingId === id) setEditingId(null);
    await loadStudentData();
  };

  const removeAssessment = async (id: string) => {
    if (!window.confirm("این ارزیابی حذف شود؟")) return;
    const response = await fetch(`/api/admin/assessments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error || "حذف ارزیابی انجام نشد.");
      return;
    }
    setSuccess("ارزیابی حذف شد.");
    await loadStudentData();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">نمرات و ارزیابی‌های کلاس‌های من</h1>
          <p className="mt-1 text-sm text-muted-foreground">فقط کلاس‌ها و درس‌هایی که برای شما اختصاص داده شده‌اند در این بخش قابل انتخاب هستند.</p>
        </div>
        <button type="button" onClick={() => loadStudentData()} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm">
          <RefreshCw className="h-4 w-4" /> بروزرسانی
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <section className="rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">انتخاب دانش‌آموز</h2>
            <p className="text-xs text-muted-foreground">ابتدا سال و کلاس اختصاص‌یافته را انتخاب کنید.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm"><span>سال تحصیلی</span><select value={yearId} onChange={(e) => setYearId(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب کنید</option>{years.map((year) => <option key={year.id} value={year.id}>{year.title}{year.isCurrent ? " (جاری)" : ""}</option>)}</select></label>
          <label className="text-sm"><span>کلاس من</span><select value={classId} onChange={(e) => setClassId(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب کلاس</option>{classes.map((item) => <option key={item.id} value={item.id}>{gradeLabel(item.grade)} — {item.name}</option>)}</select></label>
          <label className="text-sm"><span>دانش‌آموز</span><select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!classId || loading} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب دانش‌آموز</option>{students.map((student) => <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>)}</select></label>
        </div>

        {classId && !students.length && <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">برای این کلاس دانش‌آموز فعالی پیدا نشد.</p>}
      </section>

      {studentId && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 font-semibold">ثبت نمره</h2>
            <div className="grid gap-3">
              <label className="text-sm"><span>درس</span>{assignedSubjects.length > 0 && !hasClassWideAssignment ? <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب درس</option>{assignedSubjects.map((item) => <option key={item} value={item}>{item}</option>)}</select> : <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={hasClassWideAssignment ? "نام درس را وارد کنید" : "درسی برای این کلاس اختصاص داده نشده است"} disabled={!canChooseSubject} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" />}</label>
              <label className="text-sm"><span>نوبت</span><select value={term} onChange={(e) => setTerm(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3">{termOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="text-sm"><span>نمره</span><input value={score} onChange={(e) => setScore(e.target.value)} type="number" min="0" max="20" step="0.01" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
              <label className="text-sm"><span>توضیحات</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label>
              <div className="flex gap-2"><button type="button" onClick={saveGrade} disabled={saving || !canChooseSubject} className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">{saving ? "در حال ذخیره..." : editingId ? "ویرایش نمره" : "ثبت نمره"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setScore(""); setDescription(""); }} className="h-10 rounded-lg border px-4 text-sm">انصراف</button>}</div>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 font-semibold">ثبت ارزیابی هفتگی</h2>
            <div className="grid gap-3">
              <label className="text-sm"><span>درس</span>{assignedSubjects.length > 0 && !hasClassWideAssignment ? <select value={assessmentSubject} onChange={(e) => setAssessmentSubject(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3"><option value="">انتخاب درس</option>{assignedSubjects.map((item) => <option key={item} value={item}>{item}</option>)}</select> : <input value={assessmentSubject} onChange={(e) => setAssessmentSubject(e.target.value)} placeholder={hasClassWideAssignment ? "نام درس را وارد کنید" : "درسی برای این کلاس اختصاص داده نشده است"} disabled={!canChooseSubject} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" />}</label>
              <label className="text-sm"><span>عنوان ارزیابی</span><input value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
              <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm"><span>تاریخ</span><DatePicker value={assessmentDate} onChange={setAssessmentDate} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" inputClass="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label><label className="text-sm"><span>نمره</span><input value={assessmentScore} onChange={(e) => setAssessmentScore(e.target.value)} type="number" min="0" max="20" step="0.01" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label></div>
              <label className="text-sm"><span>توضیحات</span><textarea value={assessmentDescription} onChange={(e) => setAssessmentDescription(e.target.value)} rows={2} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2" /></label>
              <button type="button" onClick={saveAssessment} disabled={assessmentSaving || !canChooseSubject} className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">{assessmentSaving ? "در حال ذخیره..." : "ثبت ارزیابی"}</button>
            </div>
          </section>
        </div>
      )}

      {studentId && (
        <section className="mt-5 rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 font-semibold">سوابق ثبت‌شده</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <div><h3 className="mb-2 text-sm font-medium">نمرات</h3>{grades.length === 0 ? <p className="text-sm text-muted-foreground">هنوز نمره‌ای ثبت نشده است.</p> : <div className="space-y-2">{grades.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"><div><div className="font-medium">{item.subject} — {item.term}</div><div className="text-muted-foreground">نمره: {item.score}{item.description ? ` — ${item.description}` : ""}</div></div><div className="flex gap-1"><button type="button" onClick={() => editGrade(item)} className="rounded-md border px-2 py-1">ویرایش</button><button type="button" onClick={() => removeGrade(item.id)} className="rounded-md border p-2 text-red-600" aria-label="حذف نمره"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}</div>
            <div><h3 className="mb-2 text-sm font-medium">ارزیابی‌ها</h3>{assessments.length === 0 ? <p className="text-sm text-muted-foreground">هنوز ارزیابی‌ای ثبت نشده است.</p> : <div className="space-y-2">{assessments.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"><div><div className="font-medium">{item.subject} — {item.title}</div><div className="text-muted-foreground">نمره: {item.score}</div></div><button type="button" onClick={() => removeAssessment(item.id)} className="rounded-md border p-2 text-red-600" aria-label="حذف ارزیابی"><Trash2 className="h-4 w-4" /></button></div>)}</div>}</div>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}
