"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type Permission = {
  key: string;
  name: string;
  group: string;
};

type AccessUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  roleLabel: string;
  isActive: boolean;
  overrides: { key: string; allowed: boolean }[];
};

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  category: string;
  email: string | null;
  nationalId: string | null;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    isActive: boolean;
    permissions: { permission: Permission; allowed: boolean }[];
  } | null;
};

type UsersResponse = {
  currentUserId: string;
  canCreate: boolean;
  canEdit: boolean;
  canManagePermissions: boolean;
  users: AccessUser[];
  permissions: Permission[];
  rolePermissions: Record<string, string[]>;
  staff: StaffMember[];
  roleLabels: Record<string, string>;
};

const ROLES = [
  { value: "SCHOOL_ADMIN", label: "مدیر مدرسه" },
  { value: "CONTENT_MANAGER", label: "مدیر محتوا" },
  { value: "TEACHER", label: "معلم" },
  { value: "STAFF", label: "کادر" },
  { value: "SUPER_ADMIN", label: "مدیر ارشد" },
];

export default function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<Record<string, boolean | null>>({});
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STAFF");
  const [isActive, setIsActive] = useState(true);

  const loadUsers = async (): Promise<UsersResponse | null> => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در دریافت کاربران و دسترسی‌ها");
      setData(result);
      return result as UsersResponse;
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error(error instanceof Error ? error.message : "خطا در دریافت کاربران و دسترسی‌ها");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.staff ?? [];
    return (data?.staff ?? []).filter((member) =>
      [
        member.firstName,
        member.lastName,
        member.position,
        member.category,
        member.email ?? "",
        member.nationalId ?? "",
        member.user?.email ?? "",
        member.user ? data?.roleLabels[member.user.role] ?? member.user.role : "",
      ].join(" ").toLowerCase().includes(query),
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

  const openAccess = (member: StaffMember, sourceData = data) => {
    setSelectedStaff(member);
    setEmail(member.user?.email ?? member.email ?? "");
    setRole(member.user?.role ?? (member.position === "معلم" ? "TEACHER" : "STAFF"));
    setIsActive(member.user?.isActive ?? true);

    const state: Record<string, boolean | null> = {};
    for (const permission of sourceData?.permissions ?? []) state[permission.key] = null;
    for (const override of member.user?.permissions ?? []) {
      state[override.permission.key] = override.allowed;
    }
    setPermissionState(state);
    setAccessOpen(true);
  };

  const saveAccess = async () => {
    if (!selectedStaff) return;
    if (selectedStaff.user?.role === "SUPER_ADMIN") {
      toast.error("دسترسی‌های مدیر ارشد از این بخش قابل تغییر نیست.");
      return;
    }
    const nationalId = selectedStaff.nationalId?.trim();
    if (!nationalId) {
      toast.error("ابتدا کد ملی معتبر را در اطلاعات کادر ثبت کنید.");
      return;
    }

    setSaving(true);
    try {
      const payload: {
        name: string;
        email: string | null;
        nationalId: string;
        role: string;
        staffId: string;
        isActive: boolean;
        permissions?: { key: string; allowed: boolean | null }[];
      } = {
        name: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
        email: email.trim() || null,
        nationalId,
        role,
        staffId: selectedStaff.id,
        isActive,
      };

      if (selectedStaff.user && data?.canManagePermissions) {
        payload.permissions = Object.entries(permissionState).map(([key, allowed]) => ({
          key,
          allowed,
        }));
      }

      const response = await fetch(
        selectedStaff.user ? `/api/admin/users/${selectedStaff.user.id}` : "/api/admin/users",
        {
          method: selectedStaff.user ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "خطا در ذخیره دسترسی");

      const refreshed = await loadUsers();
      if (!refreshed) {
        throw new Error("تغییرات ذخیره شد، اما بارگذاری اطلاعات جدید انجام نشد. لطفاً صفحه را تازه‌سازی کنید.");
      }

      const refreshedStaff = refreshed.staff.find((member) => member.id === selectedStaff.id);
      if (refreshedStaff) openAccess(refreshedStaff, refreshed);
      else setAccessOpen(false);

      toast.success(selectedStaff.user ? "دسترسی‌های اختصاصی کاربر با موفقیت ذخیره شد." : "دسترسی ورود برای کادر فعال شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ذخیره دسترسی");
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdminTarget = selectedStaff?.user?.role === "SUPER_ADMIN";
  const canManageIndividualPermissions = Boolean(data?.canManagePermissions);
  const roleDefaultKeys = selectedStaff?.user
    ? new Set(data?.rolePermissions[role] ?? [])
    : new Set<string>();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">کاربران و دسترسی‌ها</h1>
            <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-xs font-medium text-[#194342]">
              {data?.staff.length ?? 0} نفر کادر
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            دسترسی ورود، نقش و مجوزهای هر عضو کادر را از این بخش مدیریت کنید.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام، سمت، نقش یا ایمیل..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pr-9"
            dir="rtl"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-[#FAF8F5]">
                  {["عضو کادر", "سمت", "نقش", "کد ملی ورود", "وضعیت دسترسی", "عملیات"].map((title) => (
                    <th key={title} className="px-5 py-3.5 text-right font-medium text-muted-foreground">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-border/30">
                      {Array.from({ length: 6 }).map((__, column) => (
                        <td key={column} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-muted" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredStaff.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">عضوی برای نمایش پیدا نشد.</td></tr>
                ) : (
                  filteredStaff.map((member) => {
                    const hasAccess = Boolean(member.user);
                    const active = Boolean(member.user?.isActive);
                    return (
                      <tr key={member.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DBE7C1] text-[#194342]">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{member.firstName} {member.lastName}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{member.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">{member.position}</td>
                        <td className="px-5 py-4">
                          {hasAccess ? (
                            <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-xs text-[#194342]">
                              {data?.roleLabels[member.user!.role] ?? member.user!.role}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">بدون دسترسی</span>}
                        </td>
                        <td className="px-5 py-4">
                          {member.nationalId ? <span dir="ltr" className="text-xs">{member.nationalId}</span> : <span className="text-xs text-muted-foreground">ثبت نشده</span>}
                        </td>
                        <td className="px-5 py-4">
                          {hasAccess ? (
                            active ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />فعال</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><XCircle className="h-3.5 w-3.5" />غیرفعال</span>
                            )
                          ) : <span className="text-xs text-muted-foreground">حسابی ندارد</span>}
                        </td>
                        <td className="px-5 py-4">
                          {data?.canEdit ? (
                            <Button variant={hasAccess ? "outline" : "default"} size="sm" className="gap-1.5" onClick={() => openAccess(member)}>
                              {hasAccess ? <KeyRound className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                              {hasAccess ? "مدیریت دسترسی" : "فعال‌سازی دسترسی"}
                            </Button>
                          ) : <span className="text-xs text-muted-foreground">بدون دسترسی مدیریتی</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={accessOpen} onOpenChange={setAccessOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff?.user ? "مدیریت دسترسی کاربران" : "فعال‌سازی دسترسی سامانه"}
            </DialogTitle>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-5 py-2">
              <div className="rounded-xl bg-[#FAF8F5] p-4">
                <p className="font-semibold">{selectedStaff.firstName} {selectedStaff.lastName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{selectedStaff.position} — {selectedStaff.category}</p>
                <p className="mt-1 text-xs text-muted-foreground">کد ملی ورود: <span dir="ltr">{selectedStaff.nationalId || "ثبت نشده"}</span></p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">ایمیل (اختیاری)</label>
                  <Input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5" dir="ltr" type="email" placeholder="example@school.ir" disabled={saving || isSuperAdminTarget} />
                </div>
                <div>
                  <label className="text-sm font-medium">نقش</label>
                  <select value={role} onChange={(event) => setRole(event.target.value)} disabled={saving || isSuperAdminTarget} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60">
                    {ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <p className="text-sm font-medium">دسترسی ورود</p>
                  <p className="mt-1 text-xs text-muted-foreground">در حالت غیرفعال، این کادر نمی‌تواند وارد سامانه شود.</p>
                </div>
                <button type="button" onClick={() => setIsActive((value) => !value)} className={`relative h-6 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${isActive ? "bg-[#194342]" : "bg-muted"}`} aria-pressed={isActive} disabled={saving || isSuperAdminTarget}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${isActive ? "right-1" : "right-6"}`} />
                </button>
              </div>

              {!selectedStaff.user && (
                <p className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">رمز اولیه حساب برابر کد ملی است و کاربر باید در اولین ورود آن را تغییر دهد.</p>
              )}

              {selectedStaff.user && isSuperAdminTarget && (
                <div className="rounded-xl border border-[#DBE7C1] bg-[#F1F5E8]/50 p-4 text-sm text-[#194342]">
                  مدیر ارشد همیشه دسترسی کامل دارد و دسترسی‌های او از این بخش قابل تغییر نیست.
                </div>
              )}

              {selectedStaff.user && !isSuperAdminTarget && (
                <div className="rounded-xl border border-[#DBE7C1] bg-[#F1F5E8]/50 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#194342]" />
                    <div>
                      <p className="font-medium">دسترسی اختصاصی این کاربر</p>
                      <p className="mt-1 text-xs text-muted-foreground">دسترسی اختصاصی کاربر می‌تواند دسترسی پیش‌فرض نقش را برای همین کاربر تغییر دهد.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedStaff.user && !isSuperAdminTarget && (
                <div className="space-y-4">
                  {!canManageIndividualPermissions && (
                    <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
                      شما مجوز مدیریت دسترسی‌های اختصاصی کاربران را ندارید.
                    </p>
                  )}
                  {groupedPermissions.map(([group, permissions]) => (
                    <section key={group} className="overflow-hidden rounded-xl border border-border/60">
                      <div className="border-b border-border/60 bg-[#FAF8F5] px-4 py-3"><h3 className="text-sm font-semibold">{group}</h3></div>
                      <div className="divide-y divide-border/50">
                        {permissions.map((permission) => {
                          const value = permissionState[permission.key] ?? null;
                          const inherited = roleDefaultKeys.has(permission.key);
                          const effective = value === null ? inherited : value;
                          return (
                            <div key={permission.key} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-medium">{permission.name}</p>
                                <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                                  <p>دسترسی پیش‌فرض نقش: {inherited ? "مجاز" : "غیرمجاز"}</p>
                                  <p>دسترسی اختصاصی این کاربر: {value === null ? "دریافت از نقش" : value ? "مجاز" : "غیرمجاز"}</p>
                                  <p className="font-medium text-[#194342]">دسترسی مؤثر: {effective ? "مجاز" : "غیرمجاز"}</p>
                                </div>
                              </div>
                              <select
                                value={value === null ? "inherit" : value ? "allow" : "deny"}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  setPermissionState((current) => ({ ...current, [permission.key]: next === "inherit" ? null : next === "allow" }));
                                }}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
                                disabled={saving || !canManageIndividualPermissions}
                              >
                                <option value="inherit">دریافت از نقش</option>
                                <option value="allow">مجاز</option>
                                <option value="deny">غیرمجاز</option>
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAccessOpen(false)} disabled={saving}>انصراف</Button>
            <Button onClick={saveAccess} disabled={saving || isSuperAdminTarget}>
              {saving ? "در حال ذخیره..." : selectedStaff?.user ? "ذخیره تغییرات" : "فعال‌سازی دسترسی"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
