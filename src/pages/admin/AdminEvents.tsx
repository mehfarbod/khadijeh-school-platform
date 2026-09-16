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

interface EventForm {
  title: string; slug: string; description: string; date: string;
  time: string; location: string; eventType: string;
}

const emptyForm: EventForm = {
  title: "", slug: "", description: "", date: "", time: "", location: "", eventType: "رویداد",
};

export default function AdminEvents() {
  const events = useQuery(api.events.list, {});
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [search, setSearch] = useState("");

  const filtered = events?.filter((e) => e.title.includes(search)) ?? [];

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (e: typeof events extends (infer T)[] | undefined ? T : never) => {
    if (!e) return;
    setEditId(e._id);
    setForm({
      title: e.title, slug: e.slug, description: e.description,
      date: e.date, time: e.time ?? "", location: e.location ?? "", eventType: e.eventType,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        time: form.time || undefined,
        location: form.location || undefined,
        isActive: true,
      };
      if (editId) {
        await updateEvent({ id: editId as any, ...data });
        toast.success("رویداد ویرایش شد");
      } else {
        await createEvent(data);
        toast.success("رویداد اضافه شد");
      }
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeEvent({ id: deleteId as any });
    setDeleteId(null);
    toast.success("رویداد حذف شد");
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">رویدادها</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت رویدادهای مدرسه</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2"><Plus className="h-4 w-4" />افزودن</Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">عنوان</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">تاریخ</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">نوع</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">مکان</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {!events ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">موردی یافت نشد.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e._id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{e.eventType}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{e.location || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(e._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "ویرایش رویداد" : "افزودن رویداد"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2"><Label className="text-xs">عنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">تاریخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">ساعت</Label><Input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-1" placeholder="۰۸:۰۰ - ۱۲:۰۰" /></div>
            <div><Label className="text-xs">نوع</Label><Input value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">مکان</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" /></div>
            <div className="col-span-2"><Label className="text-xs">توضیحات</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.date}>{editId ? "ذخیره" : "افزودن"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>حذف رویداد</AlertDialogTitle><AlertDialogDescription>آیا از حذف این رویداد اطمینان دارید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
