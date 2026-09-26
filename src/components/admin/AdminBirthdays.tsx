"use client";

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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Birthday {
  id: string;
  firstName: string;
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

const emptyForm: Form = {
  firstName: "",
  grade: "دهم",
  birthday: "",
};

export default function AdminBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);

  async function loadBirthdays() {
    try {
      setLoading(true);

      const response = await fetch("/api/birthdays?activeOnly=false");

      if (!response.ok) {
        throw new Error("Failed to load birthdays");
      }

      const data = await response.json();
      setBirthdays(data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت تولدها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBirthdays();
  }, []);

  async function createBirthday() {
    if (!form.firstName || !form.birthday) return;

    try {
      const response = await fetch("/api/birthdays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          grade: form.grade,
          birthday: form.birthday,
          isVisible: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create birthday");
      }

      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("افزوده شد");

      await loadBirthdays();
    } catch (error) {
      console.error(error);
      toast.error("خطا در افزودن تولد");
    }
  }

  async function removeBirthday(id: string) {
    try {
      const response = await fetch(`/api/birthdays/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete birthday");
      }

      toast.success("حذف شد");

      await loadBirthdays();
    } catch (error) {
      console.error(error);
      toast.error("خطا در حذف تولد");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">تولدها</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت تولدهای دانش‌آموزان
          </p>
        </div>

        <Button
          onClick={() => {
            setForm(emptyForm);
            setDialogOpen(true);
          }}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          افزودن
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
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
                تاریخ
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                عملیات
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border/30"
                >
                  {[1, 2, 3, 4].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : birthdays.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  موردی ثبت نشده.
                </td>
              </tr>
            ) : (
              birthdays.map((birthday) => (
                <tr
                  key={birthday.id}
                  className="border-b border-border/30"
                >
                  <td className="px-4 py-3 font-medium">
                    {birthday.firstName}
                  </td>

                  <td className="px-4 py-3">
                    {birthday.grade}
                  </td>

                  <td className="px-4 py-3">
                    {birthday.birthday}
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeBirthday(birthday.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن تولد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">نام</Label>

              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    firstName: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">پایه</Label>

              <Input
                value={form.grade}
                onChange={(e) =>
                  setForm({
                    ...form,
                    grade: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">
                تاریخ تولد (MM-DD)
              </Label>

              <Input
                value={form.birthday}
                onChange={(e) =>
                  setForm({
                    ...form,
                    birthday: e.target.value,
                  })
                }
                placeholder="مثلاً 09-18"
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
              onClick={createBirthday}
              disabled={!form.firstName || !form.birthday}
            >
              افزودن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}