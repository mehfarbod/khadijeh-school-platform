"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  CheckCircle2,
  Link2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type StaffUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  subject: string | null;
  category: string;
  bio: string | null;
  education: string | null;
  photo: string | null;
  phone: string | null;
  email: string | null;
  userId: string | null;
  isActive: boolean;
  user: StaffUser | null;
};

type StaffForm = {
  firstName: string;
  lastName: string;
  position: string;
  category: string;
  subject: string;
  phone: string;
  email: string;
  photo: string;
  userId: string;
  isActive: boolean;
};

const emptyForm: StaffForm = {
  firstName: "",
  lastName: "",
  position: "",
  category: "",
  subject: "",
  phone: "",
  email: "",
  photo: "",
  userId: "",
  isActive: true,
};

const POSITIONS_BY_CATEGORY: Record<string, string[]> = {
  "مدیریت": ["مدیر", "معاون"],
  "کادر آموزشی": ["معلم"],
  "مشاوره": ["مشاور"],
  "کادر اجرایی": ["مسئول آموزش", "مسئول اجرایی"],
  "خدمات": ["خدمتگزار"],
};

const CATEGORIES = Object.keys(POSITIONS_BY_CATEGORY);

const isTeacherPosition = (position: string) => position.trim() === "معلم";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "مدیر ارشد",
  SCHOOL_ADMIN: "مدیر مدرسه",
  CONTENT_MANAGER: "مدیر محتوا",
  TEACHER: "معلم",
  STAFF: "کادر",
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[] | null>(null);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);\n  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);\n  const [photoPreview, setPhotoPreview] = useState<string>("");\n  const [draggingPhoto, setDraggingPhoto] = useState(false);\n  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadStaff = async () => {
    try {
      const response = await fetch("/api/staff?activeOnly=false", { cache: "no-store" });
      if (!response.ok) throw new Error("خطا در دریافت اطلاعات کادر");
      const data: Staff[] = await response.json();
      setStaff(data);
    } catch (error) {
      console.error("Failed to load staff:", error);
      setStaff([]);
      toast.error(error instanceof Error ? error.message : "خطا در دریافت اطلاعات کادر مدرسه");
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/staff-users", { cache: "no-store" });
      if (!response.ok) throw new Error("خطا در دریافت حساب‌های پنل");
      const data: StaffUser[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
      toast.error(error instanceof Error ? error.message : "خطا در دریافت حساب‌های پنل");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadStaff(), loadUsers()]);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staff ?? [];
    return staff?.filter((member) =>
      [member.firstName, member.lastName, member.position, member.category, member.subject ?? "", member.phone ?? "", member.email ?? "", member.user?.email ?? ""]
        .join(" ").toLowerCase().includes(query)
    ) ?? [];
  }, [search, staff]);

  const teacher = isTeacherPosition(form.position);

  const positionOptions = useMemo(() => {
    const options = form.category ? [...(POSITIONS_BY_CATEGORY[form.category] ?? [])] : [];
    if (form.position && !options.includes(form.position)) {
      options.push(form.position);
    }
    return options;
  }, [form.category, form.position]);

  const updateForm = <K extends keyof StaffForm>(key: K, value: StaffForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCategoryChange = (category: string) => {
    const allowedPositions = POSITIONS_BY_CATEGORY[category] ?? [];
    setForm((current) => ({
      ...current,
      category,
      position: allowedPositions.includes(current.position) ? current.position : "",
      subject: allowedPositions.includes(current.position) && isTeacherPosition(current.position) ? current.subject : "",
    }));
  };

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
      category: member.category,
      subject: member.subject ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      photo: member.photo ?? "",
      userId: member.userId ?? "",
      isActive: member.isActive,
    });
    setDialogOpen(true);
  };

  const handlePhotoChange = (file: File | null) => {\n    if (!file) return;\n    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];\n    if (!allowedTypes.includes(file.type)) {\n      toast.error("فرمت تصویر باید JPG، PNG یا WebP باشد.");\n      return;\n    }\n    if (file.size > 5 * 1024 * 1024) {\n      toast.error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");\n      return;\n    }\n    setSelectedPhoto(file);\n    setPhotoPreview(URL.createObjectURL(file));\n  };\n\n  const handlePhotoDrop = (event: DragEvent<HTMLDivElement>) => {\n    event.preventDefault();\n    setDraggingPhoto(false);\n    handlePhotoChange(event.dataTransfer.files?.[0] ?? null);\n  };\n\n  const removePhoto = () => {\n    setSelectedPhoto(null);\n    setPhotoPreview("");\n    updateForm("photo", "");\n    if (photoInputRef.current) photoInputRef.current.value = "";\n  };\n\n  const handleSubmit = async () =>
    if (!form.firstName.trim() || !form.lastName.trim() || !form.position.trim() || !form.category.trim()) {
      toast.error("نام، نام خانوادگی، سمت و دسته‌بندی الزامی است.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        position: form.position.trim(),
        category: form.category,
        subject: teacher && form.subject.trim() ? form.subject.trim() : null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        photo: photoUrl,
        userId: form.userId || null,
        isActive: form.isActive,
      };

      const response = await fetch(editId ? `/api/staff/${editId}` : "/api/staff", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در ذخیره اطلاعات");

      toast.success(editId ? "اطلاعات کادر ویرایش شد" : "عضو جدید به کادر اضافه شد");
      setDialogOpen(false);
      await loadStaff();
    } catch (error) {
      console.error("Failed to save staff:", error);
      toast.error(error instanceof Error ? error.message : "خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member: Staff) => {
    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در تغییر وضعیت");
      toast.success(member.isActive ? "عضو کادر غیرفعال شد" : "عضو کادر فعال شد");
      await loadStaff();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در تغییر وضعیت");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/staff/${deleteId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در حذف کادر");
      setDeleteId(null);
      toast.success("عضو کادر حذف شد");
      await loadStaff();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در حذف کادر");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">کادر مدرسه</h1>
              <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-xs font-medium text-[#194342]">{staff?.length ?? 0} نفر</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">مدیریت اطلاعات کادر آموزشی و اداری مدرسه</p>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />افزودن عضو کادر</Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="جستجو بر اساس نام، سمت، دسته‌بندی، درس..." value={search} onChange={(event) => setSearch(event.target.value)} className="pr-9" />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead><tr className="border-b border-border/60 bg-[#FAF8F5]">
                {["نام و نام خانوادگی","سمت","دسته‌بندی","درس","تماس","حساب پنل","وضعیت","عملیات"].map((title) => <th key={title} className="px-5 py-3.5 text-right font-medium text-muted-foreground">{title}</th>)}
              </tr></thead>
              <tbody>
                {!staff ? Array.from({ length: 5 }).map((_, index) => <tr key={index} className="border-b border-border/30">{Array.from({ length: 8 }).map((__, columnIndex) => <td key={columnIndex} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-muted" /></td>)}</tr>)
                : filtered.length === 0 ? <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-muted-foreground">موردی برای نمایش پیدا نشد.</td></tr>
                : filtered.map((member) => <tr key={member.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DBE7C1] text-[#194342]">{member.photo ? <img src={member.photo} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-4 w-4" />}</div><span className="font-medium">{member.firstName} {member.lastName}</span></div></td>
                  <td className="px-5 py-4">{member.position}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-xs text-[#194342]">{member.category}</span></td>
                  <td className="px-5 py-4">{member.subject || "—"}</td>
                  <td className="px-5 py-4"><div className="space-y-0.5"><div>{member.phone || "—"}</div>{member.email && <div className="max-w-[190px] truncate text-xs text-muted-foreground">{member.email}</div>}</div></td>
                  <td className="px-5 py-4">{member.user ? <div className="flex items-center gap-2 text-xs"><Link2 className="h-3.5 w-3.5 text-[#194342]" /><div><div className="font-medium">{member.user.name || member.user.email}</div><div className="text-muted-foreground">{roleLabels[member.user.role] ?? member.user.role}</div></div></div> : <span className="text-xs text-muted-foreground">بدون حساب</span>}</td>
                  <td className="px-5 py-4"><button type="button" onClick={() => toggleActive(member)} className="inline-flex items-center gap-1.5 text-xs font-medium">{member.isActive ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /><span className="text-green-700">فعال</span></> : <><XCircle className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">غیرفعال</span></>}</button></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(member)} title="ویرایش"><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(member.id)} title="حذف"><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editId ? "ویرایش عضو کادر" : "افزودن عضو کادر"}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-2">
            <section>
              <div className="mb-4 flex items-center gap-2"><div className="rounded-lg bg-[#F1F5E8] p-2 text-[#194342]"><UserRound className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold">اطلاعات اصلی</h2><p className="text-xs text-muted-foreground">اطلاعات پایه عضو کادر مدرسه</p></div></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><Label>نام</Label><Input value={form.firstName} onChange={(event) => updateForm("firstName", event.target.value)} className="mt-1.5" placeholder="مثلاً مریم" /></div>
                <div><Label>نام خانوادگی</Label><Input value={form.lastName} onChange={(event) => updateForm("lastName", event.target.value)} className="mt-1.5" placeholder="مثلاً احمدی" /></div>
                <div>
                  <Label>دسته‌بندی</Label>
                  <select value={form.category} onChange={(event) => handleCategoryChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">انتخاب دسته‌بندی</option>
                    {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <Label>سمت</Label>
                  <select value={form.position} onChange={(event) => { const position = event.target.value; updateForm("position", position); if (!isTeacherPosition(position)) updateForm("subject", ""); }} disabled={!form.category} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60">
                    <option value="">{form.category ? "انتخاب سمت" : "ابتدا دسته‌بندی را انتخاب کنید"}</option>
                    {positionOptions.map((position) => <option key={position} value={position}>{position}</option>)}
                  </select>
                </div>
                {teacher && <div className="sm:col-span-2"><Label>درس</Label><Input value={form.subject} onChange={(event) => updateForm("subject", event.target.value)} className="mt-1.5" placeholder="مثلاً ریاضی" /><p className="mt-1 text-xs text-muted-foreground">این فیلد فقط برای سمت «معلم» نمایش داده می‌شود.</p></div>}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2"><div className="rounded-lg bg-[#F1F5E8] p-2 text-[#194342]"><ShieldCheck className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold">اطلاعات تماس</h2><p className="text-xs text-muted-foreground">اطلاعات تماس در صورت نیاز قابل ثبت است.</p></div></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><Label>شماره تلفن</Label><Input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="mt-1.5" placeholder="09xxxxxxxxx" dir="ltr" /></div>
                <div><Label>ایمیل</Label><Input value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="mt-1.5" placeholder="example@school.ir" dir="ltr" type="email" /></div>
                <div className="sm:col-span-2">\n                  <Label>عکس پرسنلی</Label>\n                  <div\n                    onDragOver={(event) => { event.preventDefault(); setDraggingPhoto(true); }}\n                    onDragLeave={() => setDraggingPhoto(false)}\n                    onDrop={handlePhotoDrop}\n                    onClick={() => photoInputRef.current?.click()}\n                    className={`mt-1.5 cursor-pointer rounded-xl border-2 border-dashed p-4 transition ${draggingPhoto ? "border-[#194342] bg-[#F1F5E8]" : "border-border hover:border-[#194342]/40 hover:bg-muted/20"}`}\n                  >\n                    <input\n                      ref={photoInputRef}\n                      type="file"\n                      accept="image/jpeg,image/png,image/webp"\n                      className="hidden"\n                      onChange={(event) => handlePhotoChange(event.target.files?.[0] ?? null)}\n                    />\n                    <div className="flex items-center gap-4">\n                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F1F5E8] text-[#194342]">\n                        {photoPreview ? <img src={photoPreview} alt="پیش‌نمایش عکس" className="h-full w-full object-cover" /> : <Upload className="h-6 w-6" />}\n                      </div>\n                      <div className="min-w-0">\n                        <p className="text-sm font-medium">عکس را اینجا بکشید یا برای انتخاب کلیک کنید</p>\n                        <p className="mt-1 text-xs text-muted-foreground">JPG، PNG یا WebP — حداکثر ۵ مگابایت</p>\n                        {selectedPhoto && <p className="mt-1 truncate text-xs text-[#194342]">{selectedPhoto.name}</p>}\n                      </div>\n                    </div>\n                  </div>\n                  {photoPreview && <Button type="button" variant="ghost" size="sm" className="mt-1 text-destructive" onClick={(event) => { event.stopPropagation(); removePhoto(); }}>حذف عکس</Button>}\n                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#DBE7C1] bg-[#F1F5E8]/50 p-4"><div className="mb-3 flex items-center gap-2"><Link2 className="h-4 w-4 text-[#194342]" /><div><h2 className="text-sm font-semibold">اتصال به حساب پنل</h2><p className="text-xs text-muted-foreground">اختیاری است؛ هر عضو کادر لزوماً کاربر پنل نیست.</p></div></div><select value={form.userId} onChange={(event) => updateForm("userId", event.target.value)} disabled={loadingUsers} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">{loadingUsers ? "در حال دریافت حساب‌ها..." : "بدون حساب پنل"}</option>{users.filter((user) => user.id === form.userId || !staff?.some((member) => member.userId === user.id)).map((user) => <option key={user.id} value={user.id}>{user.name || "بدون نام"} — {user.email} — {roleLabels[user.role] ?? user.role}</option>)}</select></section>

            <section><div className="flex items-center justify-between rounded-xl border border-border/60 p-4"><div><p className="text-sm font-medium">وضعیت عضو کادر</p><p className="mt-1 text-xs text-muted-foreground">عضو غیرفعال در لیست‌های عمومی نمایش داده نمی‌شود.</p></div><button type="button" onClick={() => updateForm("isActive", !form.isActive)} className={`relative h-6 w-11 rounded-full transition ${form.isActive ? "bg-[#194342]" : "bg-muted"}`} aria-pressed={form.isActive}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${form.isActive ? "right-1" : "right-6"}`} /></button></div></section>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>انصراف</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? "در حال ذخیره..." : editId ? "ذخیره تغییرات" : "افزودن عضو"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف عضو کادر</AlertDialogTitle><AlertDialogDescription>با حذف این عضو، اطلاعات او از کادر مدرسه حذف می‌شود. این عملیات قابل بازگشت نیست.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </AdminLayout>
  );
}
