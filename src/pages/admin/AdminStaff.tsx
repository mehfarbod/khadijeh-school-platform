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
  firstName: "", lastName: "", position: "", subject: "",
  category: "دبیران", bio: "", education: "", phone: "", email: "",
};

const CATEGORIES = ["مدیریت", "دبیران", "مشاوران", "کادر اجرایی"];

export default function AdminStaff() {
  const staff = useQuery(api.staff.list, {});
  const createStaff = useMutation(api.staff.create);
  const updateStaff = useMutation(api.staff.update);
  const removeStaff = useMutation(api.staff.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [search, setSearch] = useState("");

  const filtered = staff?.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.position}`.includes(search)
  ) ?? [];

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: typeof staff extends (infer T)[] | undefined ? T : never) => {
    if (!s) return;
    setEditId(s._id);
    setForm({
      firstName: s.firstName, lastName: s.lastName, position: s.position,
      subject: s.subject ?? "", category: s.category, bio: s.bio ?? "",
      education: s.education ?? "", phone: s.phone ?? "", email: s.email ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateStaff({
          id: editId as any,
          ...form,
          subject: form.subject || undefined,
          bio: form.bio || undefined,
          education: form.education || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
        });
        toast.success("کادر با موفقیت ویرایش شد");
      } else {
        await createStaff({ ...form, isActive: true });
        toast.success("کادر با موفقیت اضافه شد");
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "خطا در ذخیره‌سازی");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeStaff({ id: deleteId as any });
    setDeleteId(null);
    toast.success("کادر حذف شد");
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">کادر مدرسه</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت اطلاعات کادر آموزشی و اداری</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          افزودن
        </Button>
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
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">سمت</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">دسته‌بندی</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">درس</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {!staff ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">موردی یافت نشد.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3">{s.position}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{s.category}</span></td>
                    <td className="px-4 py-3">{s.subject || "—"}</td>
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
            <DialogTitle>{editId ? "ویرایش کادر" : "افزودن کادر"}</DialogTitle>
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
            <div className="col-span-2">
              <Label className="text-xs">سمت</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">دسته‌بندی</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">درس</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">سوابق تحصیلی</Label>
              <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">تلفن</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">ایمیل</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.firstName || !form.lastName || !form.position}>
              {editId ? "ذخیره" : "افزودن"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کادر</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این کادر اطمینان دارید؟</AlertDialogDescription>
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
