"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  academicYear: string;
  birthday: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  email: string | null;
  isActive: boolean;
}

interface StudentForm {
  firstName: string;
  lastName: string;
  grade: string;
  className: string;
  academicYear: string;
  birthday: string;
  guardianName: string;
  guardianPhone: string;
  email: string;
}

const emptyForm: StudentForm = {
  firstName: "",
  lastName: "",
  grade: "دهم",
  className: "الف",
  academicYear: "1404-1405",
  birthday: "",
  guardianName: "",
  guardianPhone: "",
  email: "",
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/students?activeOnly=false");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data: Student[] = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
      toast.error("خطا در دریافت اطلاعات دانش‌آموزان");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered =
    students?.filter(
      (student) =>
        `${student.firstName} ${student.lastName}`.includes(search) ||
        student.grade.includes(search)
    ) ?? [];

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditId(student.id);

    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      className: student.className,
      academicYear: student.academicYear,
      birthday: student.birthday ?? "",
      guardianName: student.guardianName ?? "",
      guardianPhone: student.guardianPhone ?? "",
      email: student.email ?? "",
    });

    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        grade: form.grade,
        className: form.className,
        academicYear: form.academicYear,
        birthday: form.birthday || null,
        guardianName: form.guardianName || null,
        guardianPhone: form.guardianPhone || null,
        email: form.email || null,
      };

      const response = await fetch(
        editId ? `/api/students/${editId}` : "/api/students",
        {
          method: editId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            editId ? payload : { ...payload, isActive: true }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در ذخیره‌سازی");
      }

      toast.success(
        editId
          ? "دانش‌آموز با موفقیت ویرایش شد"
          : "دانش‌آموز با موفقیت اضافه شد"
      );

      setDialogOpen(false);
      await loadStudents();
    } catch (error) {
      console.error("Failed to save student:", error);

      toast.error(
        error instanceof Error ? error.message : "خطا در ذخیره‌سازی"
      );
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
        throw new Error(data.error || "خطا در حذف دانش‌آموز");
      }

      setDeleteId(null);
      toast.success("دانش‌آموز حذف شد");

      await loadStudents();
    } catch (error) {
      console.error("Failed to delete student:", error);

      toast.error(
        error instanceof Error ? error.message : "خطا در حذف دانش‌آموز"
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">دانش‌آموزان</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت اطلاعات دانش‌آموزان
          </p>
        </div>

        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          افزودن
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  نام
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  نام خانوادگی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  پایه
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  کلاس
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {!students ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30"
                  >
                    {Array.from({ length: 5 }).map((_, columnIndex) => (
                      <td key={columnIndex} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/30 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {student.firstName}
                    </td>

                    <td className="px-4 py-3">
                      {student.lastName}
                    </td>

                    <td className="px-4 py-3">
                      {student.grade}
                    </td>

                    <td className="px-4 py-3">
                      {student.className}
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

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteId(student.id)}
                        >
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
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
                  setForm({
                    ...form,
                    firstName: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">نام خانوادگی</Label>
              <Input
                value={form.lastName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    lastName: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">پایه</Label>

              <select
                value={form.grade}
                onChange={(event) =>
                  setForm({
                    ...form,
                    grade: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option>دهم</option>
                <option>یازدهم</option>
                <option>دوازدهم</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">کلاس</Label>

              <Input
                value={form.className}
                onChange={(event) =>
                  setForm({
                    ...form,
                    className: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">سال تحصیلی</Label>

              <Input
                value={form.academicYear}
                onChange={(event) =>
                  setForm({
                    ...form,
                    academicYear: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">تاریخ تولد</Label>

              <Input
                value={form.birthday}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birthday: event.target.value,
                  })
                }
                className="mt-1"
                placeholder="MM-DD"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">نام سرپرست</Label>

              <Input
                value={form.guardianName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    guardianName: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">تلفن سرپرست</Label>

              <Input
                value={form.guardianPhone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    guardianPhone: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">ایمیل</Label>

              <Input
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              انصراف
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!form.firstName || !form.lastName}
            >
              {editId ? "ذخیره" : "افزودن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              حذف دانش‌آموز
            </AlertDialogTitle>

            <AlertDialogDescription>
              آیا از حذف این دانش‌آموز اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              انصراف
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}