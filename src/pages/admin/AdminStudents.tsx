"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

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
  firstName: "", lastName: "", grade: "دهم", className: "الف",
  academicYear: "1404-1405", birthday: "", guardianName: "",
  guardianPhone: "", email: "",
};

export default function AdminStudents() {
  const students = useQuery(api.students.list, {});
  const createStudent = useMutation(api.students.create);
  const updateStudent = useMutation(api.students.update);
  const removeStudent = useMutation(api.students.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [search, setSearch] = useState("");

  const filtered = students?.filter((s) =>
    `${s.firstName} ${s.lastName}`.includes(search) || s.grade.includes(search)
  ) ?? [];

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: typeof students extends (infer T)[] | undefined ? T : never) => {
    if (!s) return;
    setEditId(s._id);
    setForm({
      firstName: s.firstName, lastName: s.lastName, grade: s.grade,
      className: s.className, academicYear: s.academicYear,
      birthday: s.birthday ?? "", guardianName: s.guardianName ?? "",
      guardianPhone: s.guardianPhone ?? "", email: s.email ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateStudent({
          id: editId as any,
          ...form,
          birthday: form.birthday || undefined,
          guardianName: form.guardianName || undefined,
          guardianPhone: form.guardianPhone || undefined,
          email: form.email || undefined,
        });
        toast.success("دانش‌آموز با موفقیت ویرایش شد");
      } else {
        await createStudent({ ...form, isActive: true });
        toast.success("دانش‌آموز با موفقیت اضافه شد");
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "خطا در ذخیره‌سازی");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeStudent({ id: deleteId as any });
    setDeleteId(null);
    toast.success("دانش‌آموز حذف شد");
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">دانش‌آموزان</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت اطلاعات دانش‌آموزان</p>
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
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام خانوادگی</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">کلاس</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {!students ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{s.firstName}</td>
                    <td className="px-4 py-3">{s.lastName}</td>
                    <td className="px-4 py-3">{s.grade}</td>
                    <td className="px-4 py-3">{s.className}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(s._id)}>
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
            <DialogTitle>{editId ? "ویرایش دانش‌آموز" : "افزودن دانش‌آموز"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label className="text-xs">نام</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">نام خانوادگی</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">پایه</Label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option>دهم</option>
                <option>یازدهم</option>
                <option>دوازدهم</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">کلاس</Label>
              <Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">سال تحصیلی</Label>
              <Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">تاریخ تولد</Label>
              <Input value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className="mt-1" placeholder="MM-DD" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">نام سرپرست</Label>
              <Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">تلفن سرپرست</Label>
              <Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">ایمیل</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.firstName || !form.lastName}>
              {editId ? "ذخیره" : "افزودن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دانش‌آموز</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این دانش‌آموز اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
