"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import JalaliDatePicker from "@/components/ui/JalaliDatePicker";
import { gregorianToJalali } from "@/lib/date/jalali";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  GraduationCap,
  School,
  UserRound,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface AcademicYear {
  id: string;
  title: string;
  isCurrent: boolean;
}

interface Enrollment {
  id: string;
  academicYearId: string;
  grade: string;
  className: string | null;
  academicYear: AcademicYear;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  birthCertificateSerial: string | null;
  mobile: string | null;
  birthday: string | null;

  fatherFirstName: string | null;
  fatherLastName: string | null;
  fatherNationalId: string | null;
  fatherJob: string | null;
  fatherEducation: string | null;
  fatherMobile: string | null;

  motherFirstName: string | null;
  motherLastName: string | null;
  motherNationalId: string | null;
  motherJob: string | null;
  motherEducation: string | null;
  motherMobile: string | null;

  address: string | null;
  landline: string | null;
  description: string | null;

  email: string | null;
  isActive: boolean;
  enrollments: Enrollment[];
}

interface StudentForm {
  // Student
  firstName: string;
  lastName: string;
  nationalId: string;
  birthCertificateSerial: string;
  mobile: string;
  birthday: string;

  // Father
  fatherFirstName: string;
  fatherLastName: string;
  fatherNationalId: string;
  fatherJob: string;
  fatherEducation: string;
  fatherMobile: string;

  // Mother
  motherFirstName: string;
  motherLastName: string;
  motherNationalId: string;
  motherJob: string;
  motherEducation: string;
  motherMobile: string;

  // Contact
  address: string;
  landline: string;
  description: string;

  // Academic
  academicYearId: string;
  grade: string;
  className: string;
}

const grades = [
  {
    value: "10",
    label: "دهم",
  },
  {
    value: "11",
    label: "یازدهم",
  },
  {
    value: "12",
    label: "دوازدهم",
  },
];

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",

  // Compatibility with old records
  دهم: "دهم",
  یازدهم: "یازدهم",
  دوازدهم: "دوازدهم",
};

const emptyForm: StudentForm = {
  // Student
  firstName: "",
  lastName: "",
  nationalId: "",
  birthCertificateSerial: "",
  mobile: "",
  birthday: "",

  // Father
  fatherFirstName: "",
  fatherLastName: "",
  fatherNationalId: "",
  fatherJob: "",
  fatherEducation: "",
  fatherMobile: "",

  // Mother
  motherFirstName: "",
  motherLastName: "",
  motherNationalId: "",
  motherJob: "",
  motherEducation: "",
  motherMobile: "",

  // Contact
  address: "",
  landline: "",
  description: "",

  // Academic
  academicYearId: "",
  grade: "10",
  className: "",
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAcademicYears = async () => {
    try {
      const response = await fetch("/api/academic-years");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت سال‌های تحصیلی");
      }

      setAcademicYears(data);

      const currentYear = data.find((year: AcademicYear) => year.isCurrent);

      if (currentYear) {
        setSelectedYearId(currentYear.id);
      } else if (data.length > 0) {
        setSelectedYearId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load academic years:", error);

      toast.error(
        error instanceof Error ? error.message : "خطا در دریافت سال‌های تحصیلی",
      );
    }
  };

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams();

      params.set("activeOnly", "true");

      if (selectedYearId) {
        params.set("academicYearId", selectedYearId);
      }

      if (selectedGrade) {
        params.set("grade", selectedGrade);
      }

      if (selectedClass) {
        params.set("className", selectedClass);
      }

      const response = await fetch(`/api/students?${params.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در دریافت اطلاعات دانش‌آموزان");
      }

      setStudents(data);
    } catch (error) {
      console.error("Failed to load students:", error);

      setStudents([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در دریافت اطلاعات دانش‌آموزان",
      );
    }
  };

  useEffect(() => {
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (academicYears.length > 0) {
      loadStudents();
    }
  }, [selectedYearId, selectedGrade, selectedClass, academicYears.length]);

  const selectedYear = academicYears.find((year) => year.id === selectedYearId);

  const availableClasses = useMemo(() => {
    if (!students) {
      return [];
    }

    const classes = new Set<string>();

    students.forEach((student) => {
      student.enrollments.forEach((enrollment) => {
        if (
          enrollment.academicYearId === selectedYearId &&
          (!selectedGrade || enrollment.grade === selectedGrade) &&
          enrollment.className
        ) {
          classes.add(enrollment.className);
        }
      });
    });

    return Array.from(classes).sort((a, b) => a.localeCompare(b, "fa"));
  }, [students, selectedYearId, selectedGrade]);

  useEffect(() => {
    if (selectedClass && !availableClasses.includes(selectedClass)) {
      setSelectedClass("");
    }
  }, [availableClasses, selectedClass]);

  const filteredStudents = useMemo(() => {
    if (!students) {
      return [];
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        student.nationalId?.includes(normalizedSearch) ||
        student.mobile?.includes(normalizedSearch)
      );
    });
  }, [students, search]);

  const classSummary = useMemo(() => {
    if (!students) {
      return [];
    }

    const summary = new Map<string, number>();

    students.forEach((student) => {
      student.enrollments.forEach((enrollment) => {
        if (enrollment.academicYearId !== selectedYearId) {
          return;
        }

        if (selectedGrade && enrollment.grade !== selectedGrade) {
          return;
        }

        if (!enrollment.className) {
          return;
        }

        summary.set(
          enrollment.className,
          (summary.get(enrollment.className) ?? 0) + 1,
        );
      });
    });

    return Array.from(summary.entries())
      .sort(([a], [b]) => a.localeCompare(b, "fa"))
      .map(([className, count]) => ({
        className,
        count,
      }));
  }, [students, selectedYearId, selectedGrade]);

  const getCurrentEnrollment = (student: Student) => {
    return (
      student.enrollments.find(
        (enrollment) => enrollment.academicYearId === selectedYearId,
      ) ?? student.enrollments[0]
    );
  };

  const openCreate = () => {
    setEditId(null);

    setForm({
      ...emptyForm,
      academicYearId: selectedYearId || academicYears[0]?.id || "",
      grade: selectedGrade || "10",
      className: selectedClass || "",
    });

    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    const enrollment = getCurrentEnrollment(student);

    const academicYearId =
      enrollment?.academicYearId ||
      selectedYearId ||
      academicYears[0]?.id ||
      "";

    const grade = enrollment?.grade || selectedGrade || "10";

    const className = enrollment?.className || selectedClass || "";

    setEditId(student.id);

    setForm({
      // Student
      firstName: student.firstName,
      lastName: student.lastName,
      nationalId: student.nationalId ?? "",
      birthCertificateSerial: student.birthCertificateSerial ?? "",
      mobile: student.mobile ?? "",
      birthday: student.birthday ? gregorianToJalali(student.birthday) : "",

      // Father
      fatherFirstName: student.fatherFirstName ?? "",
      fatherLastName: student.fatherLastName ?? "",
      fatherNationalId: student.fatherNationalId ?? "",
      fatherJob: student.fatherJob ?? "",
      fatherEducation: student.fatherEducation ?? "",
      fatherMobile: student.fatherMobile ?? "",

      // Mother
      motherFirstName: student.motherFirstName ?? "",
      motherLastName: student.motherLastName ?? "",
      motherNationalId: student.motherNationalId ?? "",
      motherJob: student.motherJob ?? "",
      motherEducation: student.motherEducation ?? "",
      motherMobile: student.motherMobile ?? "",

      // Contact
      address: student.address ?? "",
      landline: student.landline ?? "",
      description: student.description ?? "",

      // Academic
      academicYearId,
      grade,
      className,
    });

    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("نام و نام خانوادگی الزامی است.");
      return;
    }

    if (!form.academicYearId) {
      toast.error("انتخاب سال تحصیلی الزامی است.");
      return;
    }

    if (!form.grade) {
      toast.error("انتخاب پایه تحصیلی الزامی است.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        // Student
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nationalId: form.nationalId.trim() || null,
        birthCertificateSerial: form.birthCertificateSerial.trim() || null,
        mobile: form.mobile.trim() || null,
        birthday: form.birthday.trim() || null,

        // Father
        fatherFirstName: form.fatherFirstName.trim() || null,
        fatherLastName: form.fatherLastName.trim() || null,
        fatherNationalId: form.fatherNationalId.trim() || null,
        fatherJob: form.fatherJob.trim() || null,
        fatherEducation: form.fatherEducation.trim() || null,
        fatherMobile: form.fatherMobile.trim() || null,

        // Mother
        motherFirstName: form.motherFirstName.trim() || null,
        motherLastName: form.motherLastName.trim() || null,
        motherNationalId: form.motherNationalId.trim() || null,
        motherJob: form.motherJob.trim() || null,
        motherEducation: form.motherEducation.trim() || null,
        motherMobile: form.motherMobile.trim() || null,

        // Contact
        address: form.address.trim() || null,
        landline: form.landline.trim() || null,
        description: form.description.trim() || null,

        // Enrollment
        academicYearId: form.academicYearId,
        grade: form.grade,
        className: form.className.trim() || null,

        ...(editId
          ? {}
          : {
              isActive: true,
            }),
      };

      const response = await fetch(
        editId ? `/api/students/${editId}` : "/api/students",
        {
          method: editId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ذخیره‌سازی اطلاعات");
      }

      toast.success(
        editId
          ? "اطلاعات دانش‌آموز با موفقیت ویرایش شد."
          : "دانش‌آموز با موفقیت اضافه شد.",
      );

      setDialogOpen(false);

      await loadStudents();
    } catch (error) {
      console.error("Failed to save student:", error);

      toast.error(
        error instanceof Error ? error.message : "خطا در ذخیره‌سازی اطلاعات",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در غیرفعال‌سازی دانش‌آموز");
      }

      setDeleteId(null);

      toast.success("دانش‌آموز غیرفعال شد.");

      await loadStudents();
    } catch (error) {
      console.error("Failed to deactivate student:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در غیرفعال‌سازی دانش‌آموز",
      );
    }
  };

  const updateForm = <K extends keyof StudentForm>(
    key: K,
    value: StudentForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">دانش‌آموزان</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت دانش‌آموزان بر اساس سال تحصیلی، پایه و کلاس
          </p>
        </div>

        <Button
          onClick={openCreate}
          size="sm"
          className="gap-2"
          disabled={academicYears.length === 0}
        >
          <Plus className="h-4 w-4" />
          افزودن دانش‌آموز
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <Label className="text-xs">سال تحصیلی</Label>

            <select
              value={selectedYearId}
              onChange={(event) => {
                setSelectedYearId(event.target.value);
                setSelectedGrade("");
                setSelectedClass("");
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {academicYears.length === 0 ? (
                <option value="">سالی ثبت نشده است</option>
              ) : (
                academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.title}
                    {year.isCurrent ? " — جاری" : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="min-w-[180px]">
            <Label className="text-xs">پایه</Label>

            <select
              value={selectedGrade}
              onChange={(event) => {
                setSelectedGrade(event.target.value);
                setSelectedClass("");
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">همه پایه‌ها</option>

              {grades.map((grade) => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px]">
            <Label className="text-xs">کلاس</Label>

            <select
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">همه کلاس‌ها</option>

              {availableClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Class summary */}
      {!selectedClass && classSummary.length > 0 && (
        <div className="mb-5">
          <div className="mb-3 flex items-center gap-2">
            <School className="h-4 w-4 text-muted-foreground" />

            <h2 className="text-sm font-semibold">کلاس‌ها</h2>

            {selectedGrade && (
              <span className="text-xs text-muted-foreground">
                {gradeLabels[selectedGrade] ?? selectedGrade}
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {classSummary.map(({ className, count }) => (
              <button
                key={className}
                type="button"
                onClick={() => setSelectedClass(className)}
                className="group rounded-xl border border-border/60 bg-card p-4 text-right transition hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">کلاس {className}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedYear?.title}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 text-2xl font-bold">{count}</div>

                <p className="text-xs text-muted-foreground">دانش‌آموز</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {selectedYear && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs">
            {selectedYear.title}
          </span>
        )}

        {selectedGrade && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs">
            {gradeLabels[selectedGrade] ?? selectedGrade}
          </span>
        )}

        {selectedClass && (
          <button
            type="button"
            onClick={() => setSelectedClass("")}
            className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/70"
          >
            کلاس {selectedClass} ×
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="جستجوی نام، کد ملی یا موبایل..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {/* Students table */}
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  نام و نام خانوادگی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  کد ملی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  پایه
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  کلاس
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  وضعیت
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {!students ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-border/30">
                    {Array.from({ length: 6 }).map((__, columnIndex) => (
                      <td key={columnIndex} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground/50" />

                    <p className="mt-3 text-sm text-muted-foreground">
                      دانش‌آموزی در این محدوده یافت نشد.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const enrollment = getCurrentEnrollment(student);

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-border/30 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-medium">
                        <button type="button" onClick={() => setSelectedStudent(student)} className="text-right hover:text-primary hover:underline">
                          {student.firstName} {student.lastName}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {student.nationalId || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {enrollment
                          ? (gradeLabels[enrollment.grade] ?? enrollment.grade)
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        {enrollment?.className || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {student.isActive ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            غیرفعال
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(student)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {student.isActive && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => setDeleteId(student.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>جزئیات دانش‌آموز</DialogTitle></DialogHeader>
          {selectedStudent && (() => { const enrollment = getCurrentEnrollment(selectedStudent); return <div className="grid gap-5 py-2 text-sm sm:grid-cols-2">
            <div><p className="text-xs text-muted-foreground">نام و نام خانوادگی</p><p className="mt-1 font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p></div>
            <div><p className="text-xs text-muted-foreground">کد ملی</p><p className="mt-1">{selectedStudent.nationalId || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">شماره تلفن همراه</p><p className="mt-1">{selectedStudent.mobile || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">تاریخ تولد</p><p className="mt-1">{selectedStudent.birthday || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">پایه / کلاس</p><p className="mt-1">{enrollment ? `${gradeLabels[enrollment.grade] ?? enrollment.grade} / ${enrollment.className || "بدون کلاس"}` : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">سال تحصیلی</p><p className="mt-1">{enrollment?.academicYear.title || "—"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">پدر</p><p className="mt-1">{[selectedStudent.fatherFirstName, selectedStudent.fatherLastName].filter(Boolean).join(" ") || "—"} · {selectedStudent.fatherMobile || "بدون شماره"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">مادر</p><p className="mt-1">{[selectedStudent.motherFirstName, selectedStudent.motherLastName].filter(Boolean).join(" ") || "—"} · {selectedStudent.motherMobile || "بدون شماره"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">آدرس</p><p className="mt-1 leading-7">{selectedStudent.address || "—"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">توضیحات</p><p className="mt-1 whitespace-pre-wrap leading-7">{selectedStudent.description || "—"}</p></div>
          </div>; })()}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-3xl overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "ویرایش اطلاعات دانش‌آموز" : "افزودن دانش‌آموز"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Student information */}
            <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2">
                <UserRound className="h-5 w-5 text-muted-foreground" />

                <div>
                  <h3 className="font-semibold">اطلاعات دانش‌آموز</h3>

                  <p className="text-xs text-muted-foreground">
                    مشخصات فردی و اطلاعات شناسنامه‌ای
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs">نام</Label>

                  <Input
                    value={form.firstName}
                    onChange={(event) =>
                      updateForm("firstName", event.target.value)
                    }
                    className="mt-1"
                    placeholder="نام دانش‌آموز"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">نام خانوادگی</Label>

                  <Input
                    value={form.lastName}
                    onChange={(event) =>
                      updateForm("lastName", event.target.value)
                    }
                    className="mt-1"
                    placeholder="نام خانوادگی"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">کد ملی</Label>

                  <Input
                    value={form.nationalId}
                    onChange={(event) =>
                      updateForm("nationalId", event.target.value)
                    }
                    className="mt-1"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="۱۰ رقم"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">سری شناسنامه</Label>

                  <Input
                    value={form.birthCertificateSerial}
                    onChange={(event) =>
                      updateForm("birthCertificateSerial", event.target.value)
                    }
                    className="mt-1"
                    placeholder="سری شناسنامه"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">شماره تلفن همراه</Label>

                  <Input
                    value={form.mobile}
                    onChange={(event) =>
                      updateForm("mobile", event.target.value)
                    }
                    className="mt-1"
                    inputMode="tel"
                    maxLength={11}
                    placeholder="0912..."
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">تاریخ تولد</Label>

                  <div className="mt-1">
                    <JalaliDatePicker
                      value={form.birthday}
                      onChange={(value) => updateForm("birthday", value)}
                      placeholder="تاریخ تولد"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Father information */}
            <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4">
                <h3 className="font-semibold">اطلاعات پدر</h3>

                <p className="text-xs text-muted-foreground">
                  مشخصات، شغل، تحصیلات و شماره تماس پدر
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs">نام پدر</Label>

                  <Input
                    value={form.fatherFirstName}
                    onChange={(event) =>
                      updateForm("fatherFirstName", event.target.value)
                    }
                    className="mt-1"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">نام خانوادگی پدر</Label>

                  <Input
                    value={form.fatherLastName}
                    onChange={(event) =>
                      updateForm("fatherLastName", event.target.value)
                    }
                    className="mt-1"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">کد ملی پدر</Label>

                  <Input
                    value={form.fatherNationalId}
                    onChange={(event) =>
                      updateForm("fatherNationalId", event.target.value)
                    }
                    className="mt-1"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="۱۰ رقم"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">شغل پدر</Label>

                  <Input
                    value={form.fatherJob}
                    onChange={(event) =>
                      updateForm("fatherJob", event.target.value)
                    }
                    className="mt-1"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">تحصیلات پدر</Label>

                  <Input
                    value={form.fatherEducation}
                    onChange={(event) =>
                      updateForm("fatherEducation", event.target.value)
                    }
                    className="mt-1"
                    placeholder="مثلاً دیپلم، کارشناسی..."
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">شماره تلفن همراه پدر</Label>

                  <Input
                    value={form.fatherMobile}
                    onChange={(event) =>
                      updateForm("fatherMobile", event.target.value)
                    }
                    className="mt-1"
                    inputMode="tel"
                    maxLength={11}
                    placeholder="0912..."
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            {/* Mother information */}
            <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4">
                <h3 className="font-semibold">اطلاعات مادر</h3>

                <p className="text-xs text-muted-foreground">
                  مشخصات، شغل، تحصیلات و شماره تماس مادر
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs">نام مادر</Label>

                  <Input
                    value={form.motherFirstName}
                    onChange={(event) =>
                      updateForm("motherFirstName", event.target.value)
                    }
                    className="mt-1"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">نام خانوادگی مادر</Label>

                  <Input
                    value={form.motherLastName}
                    onChange={(event) =>
                      updateForm("motherLastName", event.target.value)
                    }
                    className="mt-1"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">کد ملی مادر</Label>

                  <Input
                    value={form.motherNationalId}
                    onChange={(event) =>
                      updateForm("motherNationalId", event.target.value)
                    }
                    className="mt-1"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="۱۰ رقم"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">شغل مادر</Label>

                  <Input
                    value={form.motherJob}
                    onChange={(event) =>
                      updateForm("motherJob", event.target.value)
                    }
                    className="mt-1"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">تحصیلات مادر</Label>

                  <Input
                    value={form.motherEducation}
                    onChange={(event) =>
                      updateForm("motherEducation", event.target.value)
                    }
                    className="mt-1"
                    placeholder="مثلاً دیپلم، کارشناسی..."
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">شماره تلفن همراه مادر</Label>

                  <Input
                    value={form.motherMobile}
                    onChange={(event) =>
                      updateForm("motherMobile", event.target.value)
                    }
                    className="mt-1"
                    inputMode="tel"
                    maxLength={11}
                    placeholder="0912..."
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            {/* Contact information */}
            <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />

                <div>
                  <h3 className="font-semibold">اطلاعات تماس و آدرس</h3>

                  <p className="text-xs text-muted-foreground">
                    اطلاعات محل سکونت و راه‌های ارتباطی
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs">آدرس</Label>

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      updateForm("address", event.target.value)
                    }
                    rows={3}
                    className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                    placeholder="آدرس کامل محل سکونت"
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">تلفن ثابت</Label>

                  <Input
                    value={form.landline}
                    onChange={(event) =>
                      updateForm("landline", event.target.value)
                    }
                    className="mt-1"
                    inputMode="tel"
                    placeholder="021..."
                    disabled={saving}
                  />
                </div>

                <div>
                  <Label className="text-xs">توضیحات</Label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    rows={4}
                    className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                    placeholder="توضیحات تکمیلی..."
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            {/* Academic information */}
            <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="mb-4 flex items-center gap-2">
                <School className="h-5 w-5 text-muted-foreground" />

                <div>
                  <h3 className="font-semibold">اطلاعات تحصیلی</h3>

                  <p className="text-xs text-muted-foreground">
                    سال تحصیلی، پایه و کلاس
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-xs">سال تحصیلی</Label>

                  <select
                    value={form.academicYearId}
                    onChange={(event) =>
                      updateForm("academicYearId", event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={saving}
                  >
                    <option value="">انتخاب سال تحصیلی</option>

                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.title}
                        {year.isCurrent ? " — جاری" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">پایه</Label>

                  <select
                    value={form.grade}
                    onChange={(event) =>
                      updateForm("grade", event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={saving}
                  >
                    {grades.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">کلاس</Label>

                  <Input
                    value={form.className}
                    onChange={(event) =>
                      updateForm("className", event.target.value)
                    }
                    className="mt-1"
                    placeholder="مثلاً الف"
                    disabled={saving}
                  />
                </div>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              انصراف
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                saving || !form.firstName.trim() || !form.lastName.trim()
              }
            >
              {saving
                ? "در حال ذخیره..."
                : editId
                  ? "ذخیره تغییرات"
                  : "افزودن دانش‌آموز"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>غیرفعال‌سازی دانش‌آموز</AlertDialogTitle>

            <AlertDialogDescription>
              این دانش‌آموز از لیست فعال خارج می‌شود، اما اطلاعات و سوابق او حذف
              نخواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white"
            >
              غیرفعال‌سازی
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
