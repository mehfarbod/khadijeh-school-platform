import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Form {
  firstName: string; lastName: string; grade: string; achievement: string; academicYear: string; category: string;
}
const emptyForm: Form = { firstName: "", lastName: "", grade: "", achievement: "", academicYear: "1404-1405", category: "" };

export default function AdminTopStudents() {
  const students = useQuery(api.topStudents.list, {});
  const createItem = useMutation(api.topStudents.create);
  const updateItem = useMutation(api.topStudents.update);
  const removeItem = useMutation(api.topStudents.remove);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  const handleSubmit = async () => {
    try {
      if (editId) { await updateItem({ id: editId as any, ...form }); toast.success("ویرایش شد"); }
      else { await createItem({ ...form, isActive: true }); toast.success("افزوده شد"); }
      setDialogOpen(false);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">دانش‌آموزان برتر</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت افتخارات دانش‌آموزان</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }} size="sm" className="gap-2"><Plus className="h-4 w-4" />افزودن</Button>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">افتخارات</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
          </tr></thead>
          <tbody>
            {!students ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30">{[1,2,3,4].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : students.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">موردی ثبت نشده.</td></tr>
            ) : students.map((s) => (
              <tr key={s._id} className="border-b border-border/30">
                <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-3">{s.grade}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.achievement}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditId(s._id); setForm({ firstName: s.firstName, lastName: s.lastName, grade: s.grade, achievement: s.achievement, academicYear: s.academicYear, category: s.category ?? "" }); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(s._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "ویرایش" : "افزودن"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label className="text-xs">نام</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">نام خانوادگی</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">پایه</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="mt-1" /></div>
            <div><Label className="text-xs">دسته‌بندی</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" /></div>
            <div className="col-span-2"><Label className="text-xs">افتخارات</Label><Input value={form.achievement} onChange={(e) => setForm({ ...form, achievement: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.firstName}>{editId ? "ذخیره" : "افزودن"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader><AlertDialogTitle>حذف</AlertDialogTitle><AlertDialogDescription>آیا از حذف اطمینان دارید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={async () => { if (deleteId) { await removeItem({ id: deleteId as any }); setDeleteId(null); toast.success("حذف شد"); } }} className="bg-destructive text-white">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
