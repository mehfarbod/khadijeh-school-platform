"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type Permission = {
  key: string;
  name: string;
  group: string;
};

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  createdAt: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    category: string;
  } | null;
  overrides: {
    key: string;
    allowed: boolean;
  }[];
};

type StaffOption = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  userId: string | null;
};

type UsersResponse = {
  currentUserId: string;
  canCreate: boolean;
  canEdit: boolean;
  canManagePermissions: boolean;
  users: UserItem[];
  permissions: Permission[];
  rolePermissions: Record<string, string[]>;
  staff: StaffOption[];
  roleLabels: Record<string, string>;
};

type UserForm = {
  name: string;
  email: string;
  role: string;
  staffId: string;
  isActive: boolean;
};

const ROLES = [
  { value: "SCHOOL_ADMIN", label: "مدیر مدرسه" },
  { value: "CONTENT_MANAGER", label: "مدیر محتوا" },
  { value: "TEACHER", label: "معلم" },
  { value: "STAFF", label: "کادر" },
  { value: "SUPER_ADMIN", label: "مدیر ارشد" },
];

const emptyForm: UserForm = {
  name: "",
  email: "",
  role: "STAFF",
  staffId: "",
  isActive: true,
};

export default function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [permissionUser, setPermissionUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [permissionState, setPermissionState] = useState<Record<string, boolean | null>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در دریافت کاربران");
      setData(result);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error(error instanceof Error ? error.message : "خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.users ?? [];
    return (data?.users ?? []).filter((user) =>
      [user.name ?? "", user.email, user.roleLabel, user.staff ? `${user.staff.firstName} ${user.staff.lastName}` : ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data, search]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of data?.permissions ?? []) {
      const current = groups.get(permission.group) ?? [];
      current.push(permission);
      groups.set(permission.group, current);
    }
    return [...groups.entries()];
  }, [data?.permissions]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (user: UserItem) => {
    setEditId(user.id);
    setForm({
      name: user.name ?? "",
      email: user.email,
      role: user.role,
      staffId: user.staff?.id ?? "",
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const openPermissions = (user: UserItem) => {
    const state: Record<string, boolean | null> = {};
    for (const permission of data?.permissions ?? []) {
      state[permission.key] = null;
    }
    for (const override of user.overrides) {
      state[override.key] = override.allowed;
    }
    setPermissionUser(user);
    setPermissionState(state);
    setPermissionOpen(true);
  };

  const updateForm = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleUserSubmit = async () => {
    if (!form.email.trim()) {
      toast.error("ایمیل کاربر الزامی است.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(editId ? `/api/admin/users/${editId}` : "/api/admin/users", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          staffId: form.staffId || null,
          isActive: form.isActive,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در ذخیره کاربر");

      toast.success(editId ? "اطلاعات کاربر ذخیره شد." : "کاربر جدید ایجاد شد.");
      setDialogOpen(false);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ذخیره کاربر");
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionSave = async () => {
    if (!permissionUser) return;

    setSaving(true);
    try {
      const permissions = Object.entries(permissionState).map(([key, allowed]) => ({
        key,
        allowed,
      }));

      const response = await fetch(`/api/admin/users/${permissionUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در ذخیره دسترسی‌ها");

      toast.success("دسترسی‌های کاربر ذخیره شد.");
      setPermissionOpen(false);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ذخیره دسترسی‌ها");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (!window.confirm(`آیا از حذف کاربر «${user.name || user.email}» مطمئن هستید؟`)) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در حذف کاربر");
      toast.success("کاربر حذف شد.");
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در حذف کاربر");
    }
  };

  const roleDefaultKeys = permissionUser
    ? new Set(data?.rolePermissions[permissionUser.role] ?? [])
    : new Set<string>();

  const selectedStaffIds = new Set(
    (data?.users ?? [])
      .filter((user) => user.id !== editId && user.staff)
      .map((user) => user.staff!.id),
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">کاربران و دسترسی‌ها</h1>
              <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-xs font-medium text-[#194342]">
                {data?.users.length ?? 0} کاربر
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              مدیریت حساب‌های پنل، نقش‌ها و دسترسی‌های اختصاصی کاربران
            </p>
          </div>

          {data?.canCreate && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              افزودن کاربر
            </Button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام، ایمیل، نقش..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pr-9"
            dir="rtl"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-[#FAF8F5]">
                  {["کاربر", "نقش", "عضو کادر", "وضعیت", "دسترسی‌ها", "عملیات"].map((title) => (
                    <th key={title} className="px-5 py-3.5 text-right font-medium text-muted-foreground">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/30">
                      {Array.from({ length: 6 }).map((__, column) => (
                        <td key={column} className="px-5 py-4">
                          <div className="h-4 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">
                      کاربری برای نمایش پیدا نشد.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBE7C1] text-[#194342]">
                            {user.name?.[0] || <UserRound className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{user.name || "بدون نام"}</p>
                            <p className="mt-0.5 max-w-[250px] truncate text-xs text-muted-foreground" dir="ltr">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-xs text-[#194342]">
                          {user.roleLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.staff ? (
                          <div>
                            <p className="font-medium">{user.staff.firstName} {user.staff.lastName}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{user.staff.position}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">بدون اتصال</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" />
                            غیرفعال
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => openPermissions(user)}
                          disabled={!data?.canManagePermissions}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          مدیریت
                        </Button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {data.canEdit && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)} title="ویرایش">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {user.id !== data?.currentUserId && data?.canEdit && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => void handleDelete(user)} title="حذف">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "ویرایش کاربر" : "افزودن کاربر جدید"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>نام و نام خانوادگی</Label>
                <Input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className="mt-1.5"
                  placeholder="مثلاً مریم احمدی"
                />
              </div>

              <div>
                <Label>ایمیل</Label>
                <Input
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  className="mt-1.5"
                  placeholder="example@school.ir"
                  dir="ltr"
                  type="email"
                />
              </div>

              <div>
                <Label>نقش</Label>
                <select
                  value={form.role}
                  onChange={(event) => updateForm("role", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>اتصال به کادر مدرسه</Label>
                <select
                  value={form.staffId}
                  onChange={(event) => updateForm("staffId", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">بدون اتصال</option>
                  {(data?.staff ?? [])
                    .filter((staff) => !staff.userId || staff.userId === editId || !selectedStaffIds.has(staff.id))
                    .map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName} — {staff.position}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-[#DBE7C1] bg-[#F1F5E8]/50 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#194342]" />
                <div>
                  <p className="text-sm font-medium">ورود با کد یکبارمصرف</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    کاربر با همین ایمیل کد ورود دریافت می‌کند؛ نیازی به ساخت رمز عبور نیست.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="text-sm font-medium">وضعیت حساب</p>
                <p className="mt-1 text-xs text-muted-foreground">حساب غیرفعال نمی‌تواند وارد پنل شود.</p>
              </div>
              <button
                type="button"
                onClick={() => updateForm("isActive", !form.isActive)}
                className={`relative h-6 w-11 rounded-full transition ${form.isActive ? "bg-[#194342]" : "bg-muted"}`}
                aria-pressed={form.isActive}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${form.isActive ? "right-1" : "right-6"}`} />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>انصراف</Button>
            <Button onClick={handleUserSubmit} disabled={saving}>
              {saving ? "در حال ذخیره..." : editId ? "ذخیره تغییرات" : "ایجاد کاربر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={permissionOpen} onOpenChange={setPermissionOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              مدیریت دسترسی‌های {permissionUser?.name || permissionUser?.email || "کاربر"}
            </DialogTitle>
          </DialogHeader>

          {permissionUser && (
            <div className="space-y-5 py-2">
              <div className="rounded-xl bg-[#FAF8F5] p-4 text-sm">
                <span className="text-muted-foreground">نقش پایه: </span>
                <span className="font-semibold text-[#194342]">{permissionUser.roleLabel}</span>
                <p className="mt-1 text-xs text-muted-foreground">
                  «پیش‌فرض نقش» از Role می‌آید. گزینه «وراثت» یعنی همان دسترسی نقش استفاده شود.
                </p>
              </div>

              <div className="space-y-4">
                {groupedPermissions.map(([group, permissions]) => (
                  <section key={group} className="overflow-hidden rounded-xl border border-border/60">
                    <div className="border-b border-border/60 bg-[#FAF8F5] px-4 py-3">
                      <h3 className="text-sm font-semibold">{group}</h3>
                    </div>

                    <div className="divide-y divide-border/50">
                      {permissions.map((permission) => {
                        const value = permissionState[permission.key] ?? null;
                        const inherited = roleDefaultKeys.has(permission.key);

                        return (
                          <div key={permission.key} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium">{permission.name}</p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {value === null
                                  ? inherited ? "از نقش به ارث می‌رسد: فعال" : "از نقش به ارث می‌رسد: غیرفعال"
                                  : value ? "دسترسی اختصاصی: فعال" : "دسترسی اختصاصی: مسدود"}
                              </p>
                            </div>

                            <select
                              value={value === null ? "inherit" : value ? "allow" : "deny"}
                              onChange={(event) => {
                                const next = event.target.value;
                                setPermissionState((current) => ({
                                  ...current,
                                  [permission.key]: next === "inherit" ? null : next === "allow",
                                }));
                              }}
                              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-40"
                            >
                              <option value="inherit">پیش‌فرض نقش</option>
                              <option value="allow">اجازه دارد</option>
                              <option value="deny">اجازه ندارد</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionOpen(false)} disabled={saving}>انصراف</Button>
            <Button onClick={handlePermissionSave} disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره دسترسی‌ها"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
