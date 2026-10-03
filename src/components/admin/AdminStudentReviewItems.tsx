"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, Eye, EyeOff, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Student = { id: string; firstName: string; lastName: string };
type ReviewItem = {
  id: string;
  studentId: string;
  type: "ABSENCE" | "DISCIPLINE" | "GENERAL";
  title: string;
  description: string | null;
  occurredAt: string | null;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  isVisible: boolean;
  student: Student;
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

export default function AdminStudentReviewItems() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  async function load() {
    try {
      const [itemsResponse, studentsResponse] = await Promise.all([
        fetch("/api/admin/student-review-items", { cache: "no-store" }),
        fetch("/api/students?activeOnly=true", { cache: "no-store" }),
      ]);

      const itemsData = await itemsResponse.json();
      const studentsData = await studentsResponse.json();

      if (!itemsResponse.ok) throw new Error(itemsData.error || "خطا در دریافت موارد");
      if (!studentsResponse.ok) throw new Error(studentsData.error || "خطا در دریافت دانش‌آموزان");

      setItems(itemsData);
      setStudents(
        studentsData.map((student: Student) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
        })),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({
      ...emptyForm,
      studentId: students[0]?.id ?? "",
    });
    setDialogOpen(true);
  }

  function openEdit(item: ReviewItem) {
    setEditId(item.id);
    setForm({
      studentId: item.studentId,
      type: item.type,
      title: item.title,
      description: item.description ?? "",
      occurredAt: item.occurredAt ? new Date(item.occurredAt).toISOString().slice(0, 16) : "",
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

    const payload = {
      ...form,
      occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : null,
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

      <div className="overflow-hidden rounded-xl border border-[#E7E2DA] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E7E2DA] bg-[#FAF8F5]">
                <th className="px-4 py-3 text-right font-medium text-[#667085]">دانش‌آموز</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">نوع</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">عنوان</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">وضعیت</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">نمایش</th>
                <th className="px-4 py-3 text-right font-medium text-[#667085]">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#98A2B3]">در حال دریافت...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-[#98A2B3]" />
                    <p className="mt-3 text-sm text-[#667085]">هنوز موردی ثبت نشده است.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-[#EEEAE3] last:border-0">
                    <td className="px-4 py-3 font-medium">{item.student.firstName} {item.student.lastName}</td>
                    <td className="px-4 py-3">{typeLabels[item.type]}</td>
                    <td className="max-w-[280px] px-4 py-3">{item.title}</td>
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
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "ویرایش مورد" : "ثبت مورد نیازمند بررسی"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <label>
              <Label className="text-xs">دانش‌آموز</Label>
              <select
                value={form.studentId}
                onChange={(event) => setForm({ ...form, studentId: event.target.value })}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">انتخاب دانش‌آموز</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </label>

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
              <Label className="text-xs">تاریخ</Label>
              <Input type="datetime-local" value={form.occurredAt} onChange={(event) => setForm({ ...form, occurredAt: event.target.value })} className="mt-1" dir="ltr" />
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
