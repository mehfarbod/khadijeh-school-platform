"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Form { firstName: string; grade: string; birthday: string; }
const emptyForm: Form = { firstName: "", grade: "دهم", birthday: "" };

export default function AdminBirthdays() {
  const birthdays = useQuery(api.birthdays.list, {});
  const createItem = useMutation(api.birthdays.create);
  const removeItem = useMutation(api.birthdays.remove);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">تولدها</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت تولدهای دانش‌آموزان</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} size="sm" className="gap-2"><Plus className="h-4 w-4" />افزودن</Button>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">تاریخ</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
          </tr></thead>
          <tbody>
            {!birthdays ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30">{[1,2,3,4].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : birthdays.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">موردی ثبت نشده.</td></tr>
            ) : birthdays.map((b) => (
              <tr key={b._id} className="border-b border-border/30">
                <td className="px-4 py-3 font-medium">{b.firstName}</td>
                <td className="px-4 py-3">{b.grade}</td>
                <td className="px-4 py-3">{b.birthday}</td>
                <td className="px-4 py-3"><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { await removeItem({ id: b._id }); toast.success("حذف شد"); }}><Trash2 className="h-3.5 w-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>افزودن تولد</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs">نام</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">پایه</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">تاریخ تولد (YYYY-MM-DD)</Label><Input value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={async () => { await createItem({ ...form, isVisible: true }); setDialogOpen(false); toast.success("افزوده شد"); }} disabled={!form.firstName}>افزودن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
