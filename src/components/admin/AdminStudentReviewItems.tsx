"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import JalaliDatePicker from "@/components/ui/JalaliDatePicker";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Pencil, Plus, Trash2, Eye, EyeOff, ClipboardList, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { gregorianToJalali, jalaliToGregorian } from "@/lib/date/jalali";
import { cn } from "@/lib/utils";

type Student = { id: string; firstName: string; lastName: string };
type StudentWithEnrollment = Student & {
  enrollments: { grade: string; className: string | null }[];
};
type ReviewItem = {
  id: string;
  studentId: string;
  type: "ABSENCE" | "DISCIPLINE" | "GENERAL";
  title: string;
  description: string | null;
  occurredAt: string | null;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  isVisible: boolean;
  student: StudentWithEnrollment;
};

type SelectionData = {
  grades: string[];
  classes: string[];
  students: Student[];
  error?: string;
};

type Form = {
  studentId: string;
  type: ReviewItem["type"];
  title: string;
  description: string;
  occurredAt: string;
  status: ReviewItem["status"];
  isVisible: boolean;
};

const emptyForm: Form = {
  studentId: "",
  type: "GENERAL",
  title: "",
  description: "",
  occurredAt: "",
  status: "OPEN",
  isVisible: true,
};

const typeLabels = {
  ABSENCE: "غیبت",
  DISCIPLINE: "انضباطی",
  GENERAL: "سایر موارد",
};

const statusLabels = {
  OPEN: "نیازمند پیگیری",
  REVIEWED: "بررسی شده",
  RESOLVED: "مختومه",
};

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

const normalizedGradeValues: Record<string, string> = {
  دهم: "10",
  یازدهم: "11",
  دوازدهم: "12",
};

export default function AdminStudentReviewItems() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReviewItem["type"] | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ReviewItem["status"] | "ALL">("ALL");

  const normalizedQuery = query.trim().toLocaleLowerCase("fa");
  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !normalizedQuery ||
      `${item.student.firstName} ${item.student.lastName} ${item.title}`
        .toLocaleLowerCase("fa")
        .includes(normalizedQuery);
    const matchesType = typeFilter === "ALL" || item.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    return matchesQuery && matchesType && matchesStatus;
  });
  const selectedStudent = students.find((student) => student.id === form.studentId);

  async function load() {
    try {
      const [itemsResponse, selectionResponse] = await Promise.all([
        fetch("/api/admin/student-review-items", { cache: "no-store" }),
        fetch("/api/admin/student-review-items/selection", { cache: "no-store" }),
      ]);

      const itemsData = await itemsResponse.json();
      const selectionData: SelectionData = await selectionResponse.json();

      if (!itemsResponse.ok) throw new Error(itemsData.error || "خطا در دریافت موارد");
      if (!selectionResponse.ok) throw new Error(selectionData.error || "خطا در دریافت پایه‌ها");

      setItems(itemsData);
      setGrades(selectionData.grades);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!dialogOpen || !selectedGrade) {
      setClasses([]);
      return;
    }

    const controller = new AbortController();
    setSelectionLoading(true);
    fetch(`/api/admin/student-review-items/selection?grade=${encodeURIComponent(selectedGrade)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data: SelectionData = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در دریافت کلاس‌ها");
        setClasses(data.classes);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") toast.error(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSelectionLoading(false);
      });

    return () => controller.abort();
  }, [dialogOpen, selectedGrade]);

  useEffect(() => {
    if (!dialogOpen || !selectedGrade || !selectedClass) {
      setStudents([]);
      return;
    }

    const controller = new AbortController();
    setSelectionLoading(true);
    const params = new URLSearchParams({ grade: selectedGrade, className: selectedClass });
    fetch(`/api/admin/student-review-items/selection?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data: SelectionData = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در دریافت دانش‌آموزان");
        setStudents(data.students);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") toast.error(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSelectionLoading(false);
      });

    return () => controller.abort();
  }, [dialogOpen, selectedGrade, selectedClass]);

  function openCreate() {
    setEditId(null);
    setSelectedGrade("");
    setSelectedClass("");
    setStudents([]);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: ReviewItem) {
    const enrollment = item.student.enrollments[0];
    setEditId(item.id);
    setSelectedGrade(enrollment ? (normalizedGradeValues[enrollment.grade] ?? enrollment.grade) : "");
    setSelectedClass(enrollment?.className ?? "");
    setStudents([]);
    setForm({
      studentId: item.studentId,
      type: item.type,
      title: item.title,
      description: item.description ?? "",
      occurredAt: item.occurredAt ? gregorianToJalali(item.occurredAt) : "",
      status: item.status,
      isVisible: item.isVisible,
    });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.studentId || !form.title.trim()) {
      toast.error("دانش‌آموز و عنوان الزامی هستند.");
      return;
    }

    let normalizedOccurredAt: string | null = null;
    try {
      normalizedOccurredAt = form.occurredAt ? jalaliToGregorian(form.occurredAt) : null;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تاریخ شمسی معتبر نیست.");
      return;
    }

    const payload = {
      ...form,
      occurredAt: normalizedOccurredAt,
      description: form.description || null,
    };

    const response = await fetch(
      editId ? `/api/admin/student-review-items/${editId}` : "/api/admin/student-review-items",
      {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در ذخیره مورد");
      return;
    }

    toast.success(editId ? "مورد ویرایش شد" : "مورد ثبت شد");
    setDialogOpen(false);
    await load();
  }

  async function remove() {
    if (!deleteId) return;

    const response = await fetch(`/api/admin/student-review-items/${deleteId}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در حذف مورد");
      return;
    }

    setDeleteId(null);
    toast.success("مورد حذف شد");
    await load();
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A2332]">موارد نیازمند بررسی</h1>
          <p className="mt-1 text-sm text-[#667085]">
            ثبت غیبت، موارد انضباطی و سایر مواردی که باید در پرتال دانش‌آموز نمایش داده شوند.
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2 bg-[#194342] hover:bg-[#143736]">
          <Plus className="h-4 w-4" />
          ثبت مورد جدید
        </Button>
      </div>

      <div className="mb-4 grid gap-3 rounded-xl border border-[#E7E2DA] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="relative block">
          <span className="sr-only">جست‌وجوی موارد</span>
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجوی دانش‌آموز یا عنوان..."
            className="pr-9"
          />
        </label>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="فیلتر نوع مورد"
        >
          <option value="ALL">همه انواع</option>
          <option value="ABSENCE">غیبت</option>
          <option value="DISCIPLINE">انضباطی</option>
          <option value="GENERAL">سایر موارد</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="فیلتر وضعیت"
        >
          <option value="ALL">همه وضعیت‌ها</option>
          <option value="OPEN">نیازمند پیگیری</option>
          <option value="REVIEWED">بررسی شده</option>
          <option value="RESOLVED">مختومه</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E7E2DA] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E7E2DA] bg-[#FAF8F5]">
                <th className="px-4 py-3 text-right font-medium text-[#667085]">دانش‌آموز</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">نوع</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">عنوان</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">تاریخ</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">نمایش</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#98A2B3]">در حال دریافت...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-[#98A2B3]" />
                    <p className="mt-3 text-sm text-[#667085]">
                      {items.length === 0 ? "هنوز موردی ثبت نشده است." : "موردی مطابق فیلترهای انتخاب‌شده پیدا نشد."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#EEEAE3] last:border-0">
                    <td className="px-4 py-3 font-medium">{item.student.firstName} {item.student.lastName}</td>
                    <td className="px-4 py-3">{typeLabels[item.type]}</td>
                    <td className="max-w-[280px] px-4 py-3">{item.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[#667085]">
                      {item.occurredAt
                        ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" }).format(new Date(item.occurredAt))
                        : "ثبت نشده"}
                    </td>
                    <td className="px-4 py-3">{statusLabels[item.status]}</td>
                    <td className="px-4 py-3">
                      {item.isVisible ? <Eye className="h-4 w-4 text-[#27745A]" /> : <EyeOff className="h-4 w-4 text-[#98A2B3]" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "ویرایش مورد" : "ثبت مورد نیازمند بررسی"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <label>
              <Label className="text-xs">۱. پایه</Label>
              <select
                value={selectedGrade}
                onChange={(event) => {
                  setSelectedGrade(event.target.value);
                  setSelectedClass("");
                  setStudents([]);
                  setForm((current) => ({ ...current, studentId: "" }));
                }}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">انتخاب پایه</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {gradeLabels[grade] ?? grade}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <Label className="text-xs">۲. کلاس</Label>
              <select
                value={selectedClass}
                onChange={(event) => {
                  setSelectedClass(event.target.value);
                  setStudents([]);
                  setForm((current) => ({ ...current, studentId: "" }));
                }}
                disabled={!selectedGrade || selectionLoading}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{selectedGrade ? "انتخاب کلاس" : "ابتدا پایه را انتخاب کنید"}</option>
                {classes.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
              <Label className="text-xs">۳. دانش‌آموز</Label>
              <Popover open={studentPickerOpen} onOpenChange={setStudentPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentPickerOpen}
                    disabled={!selectedClass || selectionLoading}
                    className="mt-1 w-full justify-between font-normal"
                  >
                    <span className={cn("truncate", !selectedStudent && "text-muted-foreground")}>
                      {selectedStudent
                        ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                        : selectedClass
                          ? "جست‌وجو و انتخاب دانش‌آموز"
                          : "ابتدا کلاس را انتخاب کنید"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="z-[60] w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="جست‌وجوی نام دانش‌آموز..." />
                    <CommandList>
                      <CommandEmpty>دانش‌آموزی در این کلاس پیدا نشد.</CommandEmpty>
                      {students.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={`${student.firstName} ${student.lastName} ${student.id}`}
                          onSelect={() => {
                            setForm((current) => ({ ...current, studentId: student.id }));
                            setStudentPickerOpen(false);
                          }}
                        >
                          <Check className={cn("h-4 w-4", form.studentId === student.id ? "opacity-100" : "opacity-0")} />
                          {student.firstName} {student.lastName}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <label>
              <Label className="text-xs">نوع مورد</Label>
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as Form["type"] })}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ABSENCE">غیبت</option>
                <option value="DISCIPLINE">انضباطی</option>
                <option value="GENERAL">سایر موارد</option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <Label className="text-xs">عنوان</Label>
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1" placeholder="مثلاً غیبت در روز شنبه" />
            </label>

            <label>
              <Label className="text-xs">تاریخ (شمسی)</Label>
              <div className="mt-1 [&_.rmdp-container]:w-full">
                <JalaliDatePicker
                  value={form.occurredAt}
                  onChange={(value) => setForm({ ...form, occurredAt: value })}
                  placeholder="انتخاب تاریخ"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </label>

            <label>
              <Label className="text-xs">وضعیت</Label>
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as Form["status"] })}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="OPEN">نیازمند پیگیری</option>
                <option value="REVIEWED">بررسی شده</option>
                <option value="RESOLVED">مختومه</option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <Label className="text-xs">توضیحات</Label>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={4}
                className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="توضیحی که دانش‌آموز باید ببیند..."
              />
            </label>

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={form.isVisible} onChange={(event) => setForm({ ...form, isVisible: event.target.checked })} />
              نمایش این مورد در پرتال دانش‌آموز
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={save}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="حذف مورد"
        description="این مورد از سوابق بررسی حذف می‌شود. ادامه می‌دهید؟"
        confirmLabel="حذف"
        destructive
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={remove}
      />
    </AdminLayout>
  );
}
