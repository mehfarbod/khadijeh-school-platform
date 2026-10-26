"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AcademicYear {
  id: string;
  title: string;
  isCurrent: boolean;
}

interface SchoolClass {
  id: string;
  academicYearId: string;
  grade: string;
  name: string;
  isActive: boolean;
}

interface Enrollment {
  academicYearId: string;
  grade: string;
  className: string | null;
  class?: SchoolClass | null;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  enrollments: Enrollment[];
}

const grades = [
  { value: "10", label: "دهم" },
  { value: "11", label: "یازدهم" },
  { value: "12", label: "دوازدهم" },
];

export default function AcademicTransferPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [targetClasses, setTargetClasses] = useState<SchoolClass[]>([]);
  const [sourceYearId, setSourceYearId] = useState("");
  const [targetYearId, setTargetYearId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [targetGrade, setTargetGrade] = useState("10");
  const [targetClassId, setTargetClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedStudent = useMemo(() => students.find((student) => student.id === studentId), [students, studentId]);
  const sourceEnrollment = selectedStudent?.enrollments.find((enrollment) => enrollment.academicYearId === sourceYearId);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await fetch("/api/academic-years", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در دریافت سال‌های تحصیلی");
        setAcademicYears(data);
        const current = data.find((year: AcademicYear) => year.isCurrent);
        const source = current || data[0];
        const target = data.find((year: AcademicYear) => year.id !== source?.id) || data[1];
        setSourceYearId(source?.id || "");
        setTargetYearId(target?.id || "");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "خطا در دریافت سال‌های تحصیلی");
      } finally {
        setLoading(false);
      }
    };

    void loadYears();
  }, []);

  useEffect(() => {
    if (!sourceYearId) {
      setStudents([]);
      setStudentId("");
      return;
    }

    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const response = await fetch(`/api/students?academicYearId=${encodeURIComponent(sourceYearId)}&activeOnly=true`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در دریافت دانش‌آموزان");
        setStudents(data);
        setStudentId("");
      } catch (error) {
        setStudents([]);
        toast.error(error instanceof Error ? error.message : "خطا در دریافت دانش‌آموزان");
      } finally {
        setLoadingStudents(false);
      }
    };

    void loadStudents();
  }, [sourceYearId]);

  useEffect(() => {
    if (!sourceEnrollment) return;
    const currentGrade = Number(sourceEnrollment.grade);
    const nextGrade = Number.isFinite(currentGrade) && currentGrade < 12 ? String(currentGrade + 1) : sourceEnrollment.grade;
    setTargetGrade(nextGrade);
  }, [studentId, sourceEnrollment?.grade]);

  useEffect(() => {
    if (!targetYearId || !targetGrade) {
      setTargetClasses([]);
      setTargetClassId("");
      return;
    }

    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const params = new URLSearchParams({ academicYearId: targetYearId, grade: targetGrade, activeOnly: "true" });
        const response = await fetch(`/api/admin/classes?${params.toString()}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در دریافت کلاس‌های مقصد");
        setTargetClasses(data);
        setTargetClassId("");
      } catch (error) {
        setTargetClasses([]);
        setTargetClassId("");
        toast.error(error instanceof Error ? error.message : "خطا در دریافت کلاس‌های مقصد");
      } finally {
        setLoadingClasses(false);
      }
    };

    void loadClasses();
  }, [targetYearId, targetGrade]);

  const handleTransfer = async () => {
    if (!studentId) return toast.error("دانش‌آموز را انتخاب کنید.");
    if (!sourceYearId || !targetYearId) return toast.error("سال تحصیلی مبدأ و مقصد را انتخاب کنید.");
    if (sourceYearId === targetYearId) return toast.error("سال مبدأ و مقصد باید متفاوت باشند.");
    if (!targetClassId) return toast.error("کلاس مقصد را انتخاب کنید.");

    try {
      setSaving(true);
      const response = await fetch("/api/admin/student-academic-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, sourceAcademicYearId: sourceYearId, targetAcademicYearId: targetYearId, targetGrade, targetClassId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "انتقال تحصیلی انجام نشد.");
      toast.success(`ثبت‌نام ${selectedStudent?.firstName} ${selectedStudent?.lastName} برای سال مقصد انجام شد.`);
      setStudentId("");
      setTargetClassId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "انتقال تحصیلی انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="rounded-2xl border border-[#E7E2DA] bg-white p-8 text-center text-sm text-[#667085]">در حال آماده‌سازی...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1A2332]">ارتقا و انتقال تحصیلی</h1>
          <p className="mt-1 text-sm text-[#667085]">ثبت سال تحصیلی جدید برای دانش‌آموز توسط مدیریت مدرسه. سابقه سال قبل دست‌نخورده باقی می‌ماند.</p>
        </div>

        <div className="rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[#344054]">
              سال تحصیلی مبدأ
              <select value={sourceYearId} onChange={(event) => setSourceYearId(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9D3CA] bg-white px-3 text-sm outline-none focus:border-[#194342]">
                <option value="">انتخاب کنید</option>
                {academicYears.map((year) => <option key={year.id} value={year.id}>{year.title}{year.isCurrent ? " — جاری" : ""}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054]">
              سال تحصیلی مقصد
              <select value={targetYearId} onChange={(event) => setTargetYearId(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9D3CA] bg-white px-3 text-sm outline-none focus:border-[#194342]">
                <option value="">انتخاب کنید</option>
                {academicYears.filter((year) => year.id !== sourceYearId).map((year) => <option key={year.id} value={year.id}>{year.title}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054] sm:col-span-2">
              دانش‌آموز
              <select value={studentId} onChange={(event) => setStudentId(event.target.value)} disabled={loadingStudents} className="h-11 w-full rounded-xl border border-[#D9D3CA] bg-white px-3 text-sm outline-none disabled:bg-[#F7F5F2] focus:border-[#194342]">
                <option value="">{loadingStudents ? "در حال دریافت..." : "انتخاب دانش‌آموز"}</option>
                {students.map((student) => {
                  const enrollment = student.enrollments.find((item) => item.academicYearId === sourceYearId);
                  return <option key={student.id} value={student.id}>{student.firstName} {student.lastName}{enrollment?.className ? ` — ${enrollment.className}` : ""}</option>;
                })}
              </select>
            </label>
          </div>

          {selectedStudent && sourceEnrollment && (
            <div className="mt-5 rounded-xl bg-[#F6F7F1] p-4 text-sm text-[#475467]">
              <p className="font-semibold text-[#1A2332]">وضعیت فعلی</p>
              <p className="mt-1">{selectedStudent.firstName} {selectedStudent.lastName} — پایه {sourceEnrollment.grade} — {sourceEnrollment.class?.name || sourceEnrollment.className || "بدون کلاس"}</p>
            </div>
          )}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[#344054]">
              پایه مقصد
              <select value={targetGrade} onChange={(event) => setTargetGrade(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9D3CA] bg-white px-3 text-sm outline-none focus:border-[#194342]">
                {grades.map((grade) => <option key={grade.value} value={grade.value}>{grade.label}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-[#344054]">
              کلاس مقصد
              <select value={targetClassId} onChange={(event) => setTargetClassId(event.target.value)} disabled={loadingClasses || !targetYearId} className="h-11 w-full rounded-xl border border-[#D9D3CA] bg-white px-3 text-sm outline-none disabled:bg-[#F7F5F2] focus:border-[#194342]">
                <option value="">{loadingClasses ? "در حال دریافت..." : "انتخاب کلاس"}</option>
                {targetClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
              </select>
            </label>
          </div>

          {sourceEnrollment?.grade === "12" && targetGrade === "12" && (
            <p className="mt-4 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] p-3 text-xs leading-6 text-[#667085]">برای دانش‌آموز پایه دوازدهم، سیستم ارتقای خودکار انجام نمی‌دهد؛ مدیریت می‌تواند در صورت نیاز یک ثبت‌نام مقصد را به‌صورت دستی تعیین کند.</p>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => void handleTransfer()} disabled={saving || !studentId || !targetYearId || !targetClassId}>
              {saving ? "در حال ثبت..." : "ثبت سال تحصیلی جدید"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
