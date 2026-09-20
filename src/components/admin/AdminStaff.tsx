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

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  subject: string | null;
  category: string;
  bio: string | null;
  education: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

interface StaffForm {
  firstName: string;
  lastName: string;
  position: string;
  subject: string;
  category: string;
  bio: string;
  education: string;
  phone: string;
  email: string;
}

const emptyForm: StaffForm = {
  firstName: "",
  lastName: "",
  position: "",
  subject: "",
  category: "دبیران",
  bio: "",
  education: "",
  phone: "",
  email: "",
};

const CATEGORIES = [
  "مدیریت",
  "دبیران",
  "مشاوران",
  "کادر اجرایی",
];

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [search, setSearch] = useState("");

  const loadStaff = async () => {
    try {
      const response = await fetch("/api/staff?activeOnly=false");

      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }

      const data: Staff[] = await response.json();
      setStaff(data);
    } catch (error) {
      console.error("Failed to load staff:", error);
      setStaff([]);
      toast.error("خطا در دریافت اطلاعات کادر مدرسه");
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filtered =
    staff?.filter((member) =>
      `${member.firstName} ${member.lastName} ${member.position}`.includes(
        search
      )
    ) ?? [];

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (member: Staff) => {
    setEditId(member.id);

    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      position: member.position,
      subject: member.subject ?? "",
      category: member.category,
      bio: member.bio ?? "",
      education: member.education ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
    });

    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        position: form.position,
        subject: form.subject || null,
        category: form.category,
        bio: form.bio || null,
        education: form.education || null,
        phone: form.phone || null,
        email: form.email || null,
      };

      const response = await fetch(
        editId ? `/api/staff/${editId}` : "/api/staff",
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
          ? "کادر با موفقیت ویرایش شد"
          : "کادر با موفقیت اضافه شد"
      );

      setDialogOpen(false);
      await loadStaff();
    } catch (error) {
      console.error("Failed to save staff:", error);

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
      const response = await fetch(`/api/staff/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطا در حذف کادر");
      }

      setDeleteId(null);
      toast.success("کادر حذف شد");

      await loadStaff();
    } catch (error) {
      console.error("Failed to delete staff:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در حذف کادر"
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            کادر مدرسه
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مدیریت اطلاعات کادر آموزشی و اداری
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

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
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
                  سمت
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  دسته‌بندی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  درس
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {!staff ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30"
                  >
                    {Array.from({ length: 5 }).map(
                      (_, columnIndex) => (
                        <td
                          key={columnIndex}
                          className="px-4 py-3"
                        >
                          <div className="h-4 animate-pulse rounded bg-muted" />
                        </td>
                      )
                    )}
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
                filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border/30 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {member.firstName} {member.lastName}
                    </td>

                    <td className="px-4 py-3">
                      {member.position}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {member.category}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {member.subject || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(member)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() =>
                            setDeleteId(member.id)
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
              {editId ? "ویرایش کادر" : "افزودن کادر"}
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

            <div className="col-span-2">
              <Label className="text-xs">سمت</Label>

              <Input
                value={form.position}
                onChange={(event) =>
                  setForm({
                    ...form,
                    position: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">
                دسته‌بندی
              </Label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">درس</Label>

              <Input
                value={form.subject}
                onChange={(event) =>
                  setForm({
                    ...form,
                    subject: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-xs">
                سوابق تحصیلی
              </Label>

              <Input
                value={form.education}
                onChange={(event) =>
                  setForm({
                    ...form,
                    education: event.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">تلفن</Label>

              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone: event.target.value,
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
              disabled={
                !form.firstName ||
                !form.lastName ||
                !form.position
              }
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
              حذف کادر
            </AlertDialogTitle>

            <AlertDialogDescription>
              آیا از حذف این کادر اطمینان دارید؟
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