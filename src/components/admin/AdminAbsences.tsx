"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Absence = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
};

type Form = Omit<Absence, "id">;
const emptyForm: Form = { firstName: "", lastName: "", grade: "" };

export default function AdminAbsences() {
  const [items, setItems] = useState<Absence[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  const load = async () => {
    try {
      const response = await fetch("/api/absences?activeOnly=false", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در دریافت غیبت‌ها");
      setItems(data);
    } catch (error) {
      setItems([]);
      toast.error(error instanceof Error ? error.message : "خطا در دریافت غیبت‌ها");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.grade.trim()) {
      toast.error("نام، نام خانوادگی و پایه الزامی است.");
      return;
    }

    const response = await fetch(editId ? `/api/absences/${editId}` : "/api/absences", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در ذخیره غیبت");
      return;
    }

    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
    toast.success(editId ? "غیبت ویرایش شد" : "غیبت ثبت شد");
    await load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const response = await fetch(`/api/absences/${deleteId}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در حذف غیبت");
      return;
    }

    setDeleteId(null);
    toast.success("غیبت حذف شد");
    await load();
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Absence) => {
    setEditId(item.id);
    setForm({ firstName: item.firstName, lastName: item.lastName, grade: item.grade });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">دانش‌آموزان غایب</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ثبت غیبت‌های امروز؛ اطلاعات روزهای قبل به‌صورت خودکار پاک می‌شود.
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          ثبت غیبت
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {!items ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">در حال دریافت...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-sm text-muted-foreground">برای امروز غیبتی ثبت نشده.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border/30">
                    <td className="px-4 py-3 font-medium">{item.firstName} {item.lastName}</td>
                    <td className="px-4 py-3">{item.grade}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(item.id)}>
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
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "ویرایش غیبت" : "ثبت غیبت"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label className="text-xs">نام</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">نام خانوادگی</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">پایه</Label>
              <Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="mt-1" placeholder="مثلاً دهم تجربی" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={save}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="حذف غیبت"
        description="آیا از حذف این مورد اطمینان دارید؟"
        confirmLabel="حذف"
        destructive
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={remove}
      />
    </AdminLayout>
  );
}
