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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Pin,
} from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface Form {
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
}

const emptyForm: Form = {
  title: "",
  content: "",
  category: "عمومی",
  isPinned: false,
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [search, setSearch] = useState("");

  async function loadAnnouncements() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/announcements?activeOnly=false"
      );

      if (!response.ok) {
        throw new Error("Failed to load announcements");
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت اعلامیه‌ها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filtered = items.filter((item) =>
    item.title.includes(search)
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Announcement) => {
    setEditId(item.id);

    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      isPinned: item.isPinned,
    });

    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editId
        ? `/api/announcements/${editId}`
        : "/api/announcements";

      const response = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editId
            ? form
            : {
                ...form,
                isActive: true,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "خطا در ذخیره اعلامیه"
        );
      }

      toast.success(
        editId
          ? "اعلامیه ویرایش شد"
          : "اعلامیه اضافه شد"
      );

      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);

      await loadAnnouncements();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در ذخیره اعلامیه"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(
        `/api/announcements/${deleteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "خطا در حذف اعلامیه"
        );
      }

      setDeleteId(null);
      toast.success("اعلامیه حذف شد");

      await loadAnnouncements();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در حذف اعلامیه"
      );
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            اعلامیه‌ها
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            مدیریت اعلامیه‌های مدرسه
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
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عنوان
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  دسته‌بندی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  سنجاق
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/30"
                  >
                    {Array.from({ length: 4 }).map(
                      (_, j) => (
                        <td
                          key={j}
                          className="px-4 py-3"
                        >
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      )
                    )}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/30 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {item.title}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {item.isPinned ? (
                        <Pin className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            openEdit(item)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() =>
                            setDeleteId(item.id)
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
              {editId
                ? "ویرایش اعلامیه"
                : "افزودن اعلامیه"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">
                عنوان
              </Label>

              <Input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">
                متن
              </Label>

              <Input
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label className="text-xs">
                  دسته‌بندی
                </Label>

                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isPinned: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />

                <Label className="text-xs">
                  سنجاق شده
                </Label>
              </div>
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
              disabled={!form.title}
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
              حذف اعلامیه
            </AlertDialogTitle>

            <AlertDialogDescription>
              آیا از حذف این اعلامیه اطمینان دارید؟
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