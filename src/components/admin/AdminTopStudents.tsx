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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TopStudent {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  achievement: string;
  academicYear: string;
  category: string | null;
  isActive: boolean;
}

interface Form {
  firstName: string;
  lastName: string;
  grade: string;
  achievement: string;
  academicYear: string;
  category: string;
}

const emptyForm: Form = {
  firstName: "",
  lastName: "",
  grade: "",
  achievement: "",
  academicYear: "1404-1405",
  category: "",
};

export default function AdminTopStudents() {
  const [students, setStudents] = useState<TopStudent[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ ...emptyForm });

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/top-students?activeOnly=false");

      if (!response.ok) {
        throw new Error("Failed to fetch top students");
      }

      const data: TopStudent[] = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to load top students:", error);
      setStudents([]);
      toast.error("خطا در دریافت دانش‌آموزان برتر");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        grade: form.grade,
        achievement: form.achievement,
        academicYear: form.academicYear,
        category: form.category || null,
      };

      const response = await fetch(
        editId ? `/api/top-students/${editId}` : "/api/top-students",
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

      toast.success(editId ? "ویرایش شد" : "افزوده شد");

      setDialogOpen(false);
      await loadStudents();
    } catch (error) {
      console.error("Failed to save top student:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در ذخیره‌سازی"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/top-students/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در حذف");
      }

      setDeleteId(null);
      toast.success("حذف شد");

      await loadStudents();
    } catch (error) {
      console.error("Failed to delete top student:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در حذف"
      );
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (student: TopStudent) => {
    setEditId(student.id);

    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      achievement: student.achievement,
      academicYear: student.academicYear,
      category: student.category ?? "",
    });

    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            دانش‌آموزان برتر
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت افتخارات دانش‌آموزان
          </p>
        </div>

        <Button
          onClick={openCreate}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          افزودن
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  نام
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  پایه
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  افتخارات
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {!students ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30"
                  >
                    {[1, 2, 3, 4].map((column) => (
                      <td
                        key={column}
                        className="px-4 py-3"
                      >
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    موردی ثبت نشده.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      {student.firstName} {student.lastName}
                    </td>

                    <td className="px-4 py-3">
                      {student.grade}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {student.achievement}
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
                          onClick={() =>
                            setDeleteId(student.id)
                          }
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

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent
          className="max-w-lg"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "ویرایش" : "افزودن"}
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
              <Label className="text-xs">
                نام خانوادگی
              </Label>
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
              <Input
                value={form.grade}
                onChange={(event) =>
                  setForm({
                    ...form,
                    grade: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">
                دسته‌بندی
              </Label>
              <Input
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">
                افتخارات
              </Label>
              <Input
                value={form.achievement}
                onChange={(event) =>
                  setForm({
                    ...form,
                    achievement: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">
                سال تحصیلی
              </Label>
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
              disabled={!form.firstName}
            >
              {editId ? "ذخیره" : "افزودن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              حذف
            </AlertDialogTitle>

            <AlertDialogDescription>
              آیا از حذف اطمینان دارید؟
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