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
  mobile: string | null;
  birthday: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  email: string | null;
  isActive: boolean;
  enrollments: Enrollment[];
}

interface StudentForm {
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  birthday: string;
  guardianName: string;
  guardianPhone: string;
  email: string;
  academicYearId: string;
  grade: string;
  className: string;
}

const grades = ["دهم", "یازدهم", "دوازدهم"];

const emptyForm: StudentForm = {
  firstName: "",
  lastName: "",
  nationalId: "",
  mobile: "",
  birthday: "",
  guardianName: "",
  guardianPhone: "",
  email: "",
  academicYearId: "",
  grade: "دهم",
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
    if (!students) return [];

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
    if (!students) return [];

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
    if (!students) return [];

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

  /*
   * در حالت عادی، enrollment مربوط به سال انتخاب‌شده را پیدا می‌کنیم.
   * اگر به هر دلیل آن enrollment در پاسخ API نبود،
   * اولین enrollment موجود را برمی‌گردانیم تا فرم ویرایش
   * بدون academicYearId خالی باز نشود.
   */
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
      grade: selectedGrade || "دهم",
      className: selectedClass || "",
    });

    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    const enrollment = getCurrentEnrollment(student);

    /*
     * سال تحصیلی را از enrollment خود دانش‌آموز می‌گیریم.
     * اگر enrollment وجود نداشت، از سال انتخاب‌شده و در نهایت
     * اولین سال موجود استفاده می‌کنیم.
     */
    const academicYearId =
      enrollment?.academicYearId ||
      selectedYearId ||
      academicYears[0]?.id ||
      "";

    const grade = enrollment?.grade || selectedGrade || "دهم";

    const className = enrollment?.className || selectedClass || "";

    console.log("EDIT STUDENT:", student);
    console.log("EDIT ENROLLMENTS:", student.enrollments);
    console.log("SELECTED YEAR:", selectedYearId);
    console.log("ACADEMIC YEARS:", academicYears);
    console.log("CURRENT ENROLLMENT:", enrollment);

    setEditId(student.id);

    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      nationalId: student.nationalId ?? "",
      mobile: student.mobile ?? "",

      // تاریخ موجود در دیتابیس میلادی است.
      // برای نمایش در فرم، آن را به تاریخ شمسی تبدیل می‌کنیم.
      birthday: student.birthday ? gregorianToJalali(student.birthday) : "",

      guardianName: student.guardianName ?? "",
      guardianPhone: student.guardianPhone ?? "",
      email: student.email ?? "",
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
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nationalId: form.nationalId.trim() || null,
        mobile: form.mobile.trim() || null,

        // تاریخ به صورت Jalali string به API ارسال می‌شود.
        // API آن را به Gregorian DateTime تبدیل می‌کند.
        birthday: form.birthday.trim() || null,

        guardianName: form.guardianName.trim() || null,
        guardianPhone: form.guardianPhone.trim() || null,
        email: form.email.trim() || null,
        academicYearId: form.academicYearId,
        grade: form.grade,
        className: form.className.trim() || null,
        ...(editId
          ? {}
          : {
              isActive: true,
            }),
      };

      console.log("SENDING PAYLOAD:", payload);
      console.log(
        "FETCH URL:",
        editId ? `/api/students/${editId}` : "/api/students",
      );

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

      console.log("RESPONSE STATUS:", response.status);

      const data = await response.json();

      console.dir(data.details, { depth: null });

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
    if (!deleteId) return;

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

      {/* Year selector */}
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
                <option key={grade} value={grade}>
                  {grade}
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
                {selectedGrade}
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
            {selectedGrade}
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
                    {Array.from({
                      length: 6,
                    }).map((__, columnIndex) => (
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
                        {student.firstName} {student.lastName}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {student.nationalId || "—"}
                      </td>

                      <td className="px-4 py-3">{enrollment?.grade || "—"}</td>

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
                            onClick={() => {
                              console.log("=== EDIT BUTTON ===");
                              console.log("STUDENT ID:", student.id);
                              console.log("STUDENT:", student);
                              console.log("ENROLLMENTS:", student.enrollments);

                              openEdit(student);
                            }}
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

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-2xl overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "ویرایش دانش‌آموز" : "افزودن دانش‌آموز"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label className="text-xs">نام</Label>

              <Input
                value={form.firstName}
                onChange={(event) =>
                  updateForm("firstName", event.target.value)
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">نام خانوادگی</Label>

              <Input
                value={form.lastName}
                onChange={(event) => updateForm("lastName", event.target.value)}
                className="mt-1"
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
              />
            </div>

            <div>
              <Label className="text-xs">شماره تلفن همراه</Label>

              <Input
                value={form.mobile}
                onChange={(event) => updateForm("mobile", event.target.value)}
                className="mt-1"
                inputMode="tel"
                maxLength={11}
                placeholder="0912..."
              />
            </div>

            <div>
              <Label className="text-xs">سال تحصیلی</Label>

              <select
                value={form.academicYearId}
                onChange={(event) =>
                  updateForm("academicYearId", event.target.value)
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                onChange={(event) => updateForm("grade", event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
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

            <div>
              <Label className="text-xs">نام ولی / سرپرست</Label>

              <Input
                value={form.guardianName}
                onChange={(event) =>
                  updateForm("guardianName", event.target.value)
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">شماره ولی / سرپرست</Label>

              <Input
                value={form.guardianPhone}
                onChange={(event) =>
                  updateForm("guardianPhone", event.target.value)
                }
                className="mt-1"
                inputMode="tel"
                maxLength={11}
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">ایمیل</Label>

              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="mt-1"
              />
            </div>
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
              onClick={() => {
                console.log("SAVE BUTTON CLICKED");
                console.log("FORM:", form);
                console.log("EDIT ID:", editId);

                handleSubmit();
              }}
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
