"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { Check, GraduationCap, Pencil, RefreshCw, Trash2, X } from "lucide-react";

type Year = { id: string; title: string; isCurrent: boolean };
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  enrollments: { grade: string; className: string | null }[];
};
type Assessment = {
  id: string;
  studentId: string;
  academicYearId: string;
  subject: string;
  type: string;
  title: string;
  assessmentDate: string | null;
  score: string;
  description: string | null;
};

type Grade = {
  id: string;
  studentId: string;
  academicYearId: string;
  subject: string;
  term: string;
  score: string;
  description: string | null;
};

const termOptions = [
  { value: "مستمر نوبت اول", label: "مستمر نوبت اول" },
  { value: "نوبت اول", label: "نوبت اول" },
  { value: "مستمر نوبت دوم", label: "مستمر نوبت دوم" },
  { value: "نوبت دوم", label: "نوبت دوم" },
];

export default function AdminGrades() {
  const [years, setYears] = useState<Year[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [yearId, setYearId] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("نوبت اول");
  const [score, setScore] = useState("");
  const [description, setDescription] = useState("");
  const [assessmentSubject, setAssessmentSubject] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [assessmentScore, setAssessmentScore] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (yearId) params.set("academicYearId", yearId);
      if (gradeFilter) params.set("grade", gradeFilter);
      if (classFilter) params.set("className", classFilter);
      if (studentId) params.set("studentId", studentId);

      const response = await fetch(`/api/admin/grades?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "خطا در دریافت نمرات.");

      setYears(data.academicYears);
      setStudents(data.students);
      setGrades(data.grades);
      setInitialLoaded(true);

      if (!yearId && data.academicYears[0]) {
        setYearId(data.academicYears[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در دریافت اطلاعات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [yearId, gradeFilter, classFilter, studentId]);

  useEffect(() => {
    loadAssessments();
  }, [yearId, studentId]);

  const classes = useMemo(
    () =>
      Array.from(
        new Set(
          students
            .map((student) => student.enrollments[0]?.className)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [students],
  );

  const studentGrades = useMemo(
    () => grades.filter((item) => item.studentId === studentId),
    [grades, studentId],
  );

  const loadAssessments = async () => {
    if (!studentId || !yearId) {
      setAssessments([]);
      return;
    }
    try {
      const response = await fetch(`/api/admin/assessments?studentId=${studentId}&academicYearId=${yearId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "خطا در دریافت ارزیابی‌ها.");
      setAssessments(data.assessments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در دریافت ارزیابی‌ها.");
    }
  };

  const save = async () => {
    setError("");
    setSuccess("");

    const numericScore = Number(score);
    if (!yearId || !studentId || !subject.trim() || !term || !Number.isFinite(numericScore) || numericScore < 0 || numericScore > 20) {
      setError("سال تحصیلی، دانش‌آموز، درس، نوبت و نمره بین ۰ تا ۲۰ الزامی است.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          academicYearId: yearId,
          subject,
          term,
          score: numericScore,
          description: description || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ثبت نمره انجام نشد.");

      setSuccess(editingId ? "نمره با موفقیت ویرایش شد." : "نمره با موفقیت ثبت شد.");
      setEditingId(null);
      setScore("");
      setDescription("");
      await load();
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
      setError("سال تحصیلی، دانش‌آموز، درس، عنوان ارزیابی و نمره بین ۰ تا ۲۰ الزامی است.");
      return;
    }
    setAssessmentSaving(true);
    try {
      const response = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          academicYearId: yearId,
          subject: assessmentSubject,
          type: "هفتگی",
          title: assessmentTitle,
          assessmentDate: assessmentDate || null,
          score: numericScore,
          description: assessmentDescription || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ثبت ارزیابی انجام نشد.");
      setSuccess("ارزیابی هفتگی با موفقیت ثبت شد.");
      setAssessmentTitle("");
      setAssessmentDate("");
      setAssessmentScore("");
      setAssessmentDescription("");
      await loadAssessments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت ارزیابی انجام نشد.");
    } finally {
      setAssessmentSaving(false);
    }
  };

  const removeAssessment = async (id: string) => {
    if (!window.confirm("این ارزیابی حذف شود؟")) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/assessments?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "حذف ارزیابی انجام نشد.");
      setSuccess("ارزیابی حذف شد.");
      await loadAssessments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف ارزیابی انجام نشد.");
    }
  };

  const startEdit = (item: Grade) => {
    setEditingId(item.id);
    setSubject(item.subject);
    setTerm(item.term);
    setScore(item.score);
    setDescription(item.description || "");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSubject("");
    setScore("");
    setDescription("");
    setError("");
  };

  const removeGrade = async (id: string) => {
    if (!window.confirm("این نمره حذف شود؟")) return;
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/grades?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "حذف نمره انجام نشد.");
      setSuccess("نمره با موفقیت حذف شد.");
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "حذف نمره انجام نشد.");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">نمرات و کارنامه</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ثبت و مدیریت نمرات دانش‌آموزان
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          بروزرسانی
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <section className="rounded-xl border border-border/60 bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">ثبت نمره</h2>
            <p className="text-xs text-muted-foreground">ابتدا سال، پایه و کلاس را مشخص کنید.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm">
            <span>سال تحصیلی</span>
            <select value={yearId} onChange={(e) => { setYearId(e.target.value); setStudentId(""); }} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3">
              <option value="">انتخاب کنید</option>
              {years.length === 0 && initialLoaded && <option value="" disabled>سال تحصیلی ثبت نشده است</option>}
              {years.map((year) => <option key={year.id} value={year.id}>{year.title}{year.isCurrent ? " (جاری)" : ""}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <span>پایه</span>
            <select value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); setClassFilter(""); setStudentId(""); }} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3">
              <option value="">همه پایه‌ها</option>
              <option value="10">دهم</option>
              <option value="11">یازدهم</option>
              <option value="12">دوازدهم</option>
            </select>
          </label>

          <label className="text-sm">
            <span>کلاس</span>
            <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setStudentId(""); }} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3">
              <option value="">همه کلاس‌ها</option>
              {classes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="text-sm">
            <span>دانش‌آموز</span>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3">
              <option value="">انتخاب کنید</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="text-sm">
            <span>درس</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثلاً ریاضی" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" />
          </label>
          <label className="text-sm">
            <span>نوبت</span>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3">
              {termOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span>نمره</span>
            <input value={score} onChange={(e) => setScore(e.target.value)} type="number" min="0" max="20" step="0.25" inputMode="decimal" placeholder="۰ تا ۲۰" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" />
          </label>
          <label className="text-sm">
            <span>توضیحات</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اختیاری" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" />
          </label>
        </div>

        <button type="button" disabled={saving} onClick={save} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {editingId ? <Pencil className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {saving ? "در حال ذخیره..." : editingId ? "ذخیره ویرایش" : "ثبت نمره"}
        </button>
        {editingId && (
          <button type="button" onClick={cancelEdit} className="mr-2 inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium">
            <X className="h-4 w-4" />
            لغو ویرایش
          </button>
        )}
      </section>

      {studentId && (
        <section className="mt-5 rounded-xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 font-semibold">
            نمرات {students.find((student) => student.id === studentId)?.firstName} {students.find((student) => student.id === studentId)?.lastName}
          </h2>
          {studentGrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز نمره‌ای ثبت نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead><tr className="border-b"><th className="px-3 py-2 text-right">درس</th><th className="px-3 py-2 text-right">نوبت</th><th className="px-3 py-2 text-right">نمره</th><th className="px-3 py-2 text-right">توضیحات</th><th className="px-3 py-2 text-right">عملیات</th></tr></thead>
                <tbody>
                  {studentGrades.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-3">{item.subject}</td>
                      <td className="px-3 py-3">{item.term}</td>
                      <td className="px-3 py-3 font-medium">{item.score}</td>
                      <td className="px-3 py-3 text-muted-foreground">{item.description || "—"}</td>
                      <td className="px-3 py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => startEdit(item)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"><Pencil className="h-3.5 w-3.5" />ویرایش</button><button type="button" onClick={() => removeGrade(item.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600"><Trash2 className="h-3.5 w-3.5" />حذف</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {studentId && (
        <section className="mt-5 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-5">
            <h2 className="font-semibold">ارزیابی‌های هفتگی</h2>
            <p className="mt-1 text-xs text-muted-foreground">اختیاری؛ می‌توانید برای هر درس هر تعداد ارزیابی هفتگی ثبت کنید.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <label className="text-sm"><span>درس</span><input value={assessmentSubject} onChange={(e) => setAssessmentSubject(e.target.value)} placeholder="مثلاً ریاضی" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
            <label className="text-sm"><span>عنوان ارزیابی</span><input value={assessmentTitle} onChange={(e) => setAssessmentTitle(e.target.value)} placeholder="آزمون فصل اول" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
            <label className="text-sm"><span>تاریخ</span><input value={assessmentDate} onChange={(e) => setAssessmentDate(e.target.value)} type="date" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
            <label className="text-sm"><span>نمره</span><input value={assessmentScore} onChange={(e) => setAssessmentScore(e.target.value)} type="number" min="0" max="20" step="0.25" inputMode="decimal" placeholder="۰ تا ۲۰" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
            <label className="text-sm"><span>توضیحات</span><input value={assessmentDescription} onChange={(e) => setAssessmentDescription(e.target.value)} placeholder="اختیاری" className="mt-1.5 h-10 w-full rounded-lg border bg-background px-3" /></label>
          </div>
          <button type="button" disabled={assessmentSaving} onClick={saveAssessment} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
            <Check className="h-4 w-4" />
            {assessmentSaving ? "در حال ذخیره..." : "ثبت ارزیابی هفتگی"}
          </button>
          {assessments.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="border-b"><th className="px-3 py-2 text-right">درس</th><th className="px-3 py-2 text-right">عنوان</th><th className="px-3 py-2 text-right">تاریخ</th><th className="px-3 py-2 text-right">نمره</th><th className="px-3 py-2 text-right">عملیات</th></tr></thead>
                <tbody>{assessments.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-3">{item.subject}</td><td className="px-3 py-3">{item.title}</td>
                    <td className="px-3 py-3">{item.assessmentDate ? new Intl.DateTimeFormat("fa-IR").format(new Date(item.assessmentDate)) : "—"}</td>
                    <td className="px-3 py-3 font-medium">{item.score}</td>
                    <td className="px-3 py-3"><button type="button" onClick={() => removeAssessment(item.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600"><Trash2 className="h-3.5 w-3.5" />حذف</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {loading && <p className="mt-4 text-sm text-muted-foreground">در حال دریافت اطلاعات...</p>}
    </AdminLayout>
  );
}
