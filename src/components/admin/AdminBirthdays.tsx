"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

interface Birthday {
  id: string;
  type: "student" | "manual";
  firstName: string;
  lastName: string;
  grade: string;
  birthday: string;
  photo: string | null;
  isVisible: boolean;
}

interface Form {
  firstName: string;
  grade: string;
  birthday: string;
}

const emptyForm: Form = { firstName: "", grade: "10", birthday: "" };

function formatStudentGrade(value: string) {
  return ({ "10": "دهم", "11": "یازدهم", "12": "دوازدهم" }[value] ?? value);
}

export default function AdminBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadBirthdays() {
    try {
      setLoading(true);
      const response = await fetch("/api/birthdays?activeOnly=false", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در دریافت تولدها");
      setBirthdays(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در دریافت تولدها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBirthdays(); }, []);

  async function toggleStudentVisibility(birthday: Birthday) {
    const response = await fetch(`/api/students/${birthday.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBirthdayVisible: !birthday.isVisible }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در تغییر وضعیت نمایش");
      return;
    }

    toast.success(birthday.isVisible ? "تولد موقتاً مخفی شد" : "تولد دوباره نمایش داده می‌شود");
    await loadBirthdays();
  }

  async function createManualBirthday() {
    if (!form.firstName.trim()) {
      toast.error("نام دانش‌آموز الزامی است.");
      return;
    }

    if (!/^\d{1,2}[-/]\d{1,2}$/.test(form.birthday.trim())) {
      toast.error("تاریخ را مانند ۰۹/۱۸ وارد کنید.");
      return;
    }

    const response = await fetch("/api/birthdays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        grade: formatStudentGrade(form.grade),
        birthday: form.birthday.trim(),
        isVisible: true,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در افزودن تولد");
      return;
    }

    setDialogOpen(false);
    setForm(emptyForm);
    toast.success("تولد اضافه شد");
    await loadBirthdays();
  }

  async function removeManualBirthday() {
    if (!deleteId) return;

    const response = await fetch(`/api/birthdays/${deleteId}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "خطا در حذف تولد");
      return;
    }

    setDeleteId(null);
    toast.success("تولد حذف شد");
    await loadBirthdays();
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">تولدها</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تولد دانش‌آموزان از اطلاعات ثبت‌شده آن‌ها خوانده می‌شود. امکان مخفی‌کردن موقت یا افزودن تولد دستی وجود دارد.
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          افزودن تولد دستی
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">تاریخ تولد</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">منبع</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">وضعیت نمایش</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">در حال دریافت...</td></tr>
              ) : birthdays.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">تولدی ثبت نشده.</td></tr>
              ) : birthdays.map((birthday) => (
                <tr key={`${birthday.type}-${birthday.id}`} className="border-b border-border/30">
                  <td className="px-4 py-3 font-medium">
                    {birthday.firstName} {birthday.lastName}
                  </td>
                  <td className="px-4 py-3">{birthday.grade}</td>
                  <td className="px-4 py-3">{birthday.type === "student" ? "از پرونده دانش‌آموز" : birthday.birthday}</td>
                  <td className="px-4 py-3">
                    {birthday.type === "student" ? "ثبت‌نام دانش‌آموز" : "دستی"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={birthday.isVisible ? "text-emerald-600" : "text-muted-foreground"}>
                      {birthday.isVisible ? "نمایش داده می‌شود" : "مخفی"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {birthday.type === "student" ? (
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => toggleStudentVisibility(birthday)}>
                          {birthday.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {birthday.isVisible ? "مخفی" : "نمایش"}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(birthday.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>افزودن تولد دستی</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">نام</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">پایه</Label>
              <Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">تاریخ تولد</Label>
              <Input value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} placeholder="مثلاً ۰۹/۱۸" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={createManualBirthday}>افزودن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="حذف تولد دستی"
        description="این تولد دستی از فهرست حذف می‌شود. ادامه می‌دهید؟"
        confirmLabel="حذف"
        destructive
        onConfirm={removeManualBirthday}
      />
    </AdminLayout>
  );
}
