"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Check, Search, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Registration = {
  id: string;
  studentFirstName: string;
  studentLastName: string;
  grade: string;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
};

const labels: Record<Registration["status"], string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
  CANCELLED: "لغو شده",
};

const classes: Record<Registration["status"], string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function AdminRegistrations() {
  const [items, setItems] = useState<Registration[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Registration["status"] | "ALL">("ALL");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [deleteItem, setDeleteItem] = useState<Registration | null>(null);

  const load = async () => {
    try {
      setError("");

      const response = await fetch("/api/course-registrations", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "خطا در دریافت ثبت‌نام‌های دوره");
      }

      setItems(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "خطا در دریافت ثبت‌نام‌های دوره",
      );
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (
    id: string,
    status: Registration["status"],
  ) => {
    try {
      setError("");

      const response = await fetch("/api/course-registrations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "عملیات انجام نشد.");
      }

      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "عملیات انجام نشد.");
    }
  };

  const removeRegistration = async (item: Registration) => {
    try {
      setError("");

      const response = await fetch(
        `/api/course-registrations?id=${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "حذف ثبت‌نام انجام نشد.");
      }

      await load();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "حذف ثبت‌نام انجام نشد.",
      );
    }
  };

  const filteredItems = (items ?? []).filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [item.studentFirstName, item.studentLastName, item.course.title, item.grade].join(" ").toLowerCase().includes(query);
    return matchesSearch && (statusFilter === "ALL" || item.status === statusFilter);
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          ثبت‌نام دوره‌ها
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          درخواست‌های ثبت‌نام دوره‌های سایت اصلی را بررسی و مدیریت کنید.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی دانش‌آموز یا دوره..." className="h-10 w-full rounded-lg border border-border bg-background pr-9 pl-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Registration["status"] | "ALL")} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
          <option value="ALL">همه وضعیت‌ها</option>
          {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {[
                  "دانش‌آموز",
                  "دوره",
                  "پایه",
                  "توضیحات",
                  "وضعیت",
                  "تاریخ",
                  "عملیات",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-right font-medium text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!items ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    در حال دریافت...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-muted-foreground"
                  >
                    موردی مطابق فیلترها پیدا نشد.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      <button type="button" onClick={() => setSelected(item)} className="text-right font-medium text-primary hover:underline">{item.studentFirstName} {item.studentLastName}</button>
                    </td>

                    <td className="px-4 py-3">{item.course.title}</td>

                    <td className="px-4 py-3">{item.grade}</td>

                    <td className="max-w-[260px] px-4 py-3 text-xs text-muted-foreground">
                      {item.notes || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${classes[item.status]}`}
                      >
                        {labels[item.status]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("fa-IR").format(
                        new Date(item.createdAt),
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {item.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              title="تأیید"
                              onClick={() => setStatus(item.id, "APPROVED")}
                              className="rounded-md p-2 text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              title="رد"
                              onClick={() => setStatus(item.id, "REJECTED")}
                              className="rounded-md p-2 text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          title="حذف ثبت‌نام"
                          onClick={() => setDeleteItem(item)}
                          className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="w-full max-w-lg rounded-2xl bg-background p-5 shadow-2xl" dir="rtl">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">جزئیات ثبت‌نام</h2><p className="mt-1 text-xs text-muted-foreground">{selected.course.title}</p></div><button type="button" onClick={() => setSelected(null)}><X className="h-5 w-5" /></button></div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">دانش‌آموز: </span>{selected.studentFirstName} {selected.studentLastName}</div>
              <div><span className="text-muted-foreground">پایه: </span>{selected.grade}</div>
              <div><span className="text-muted-foreground">وضعیت: </span>{labels[selected.status]}</div>
              <div><span className="text-muted-foreground">تاریخ ثبت: </span>{new Intl.DateTimeFormat("fa-IR").format(new Date(selected.createdAt))}</div>
            </div>
            <div className="mt-5 rounded-xl bg-muted/40 p-4"><p className="mb-2 text-xs font-medium text-muted-foreground">توضیحات</p><p className="whitespace-pre-wrap text-sm leading-7">{selected.notes || "توضیحی ثبت نشده است."}</p></div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteItem} onOpenChange={(open) => { if (!open) setDeleteItem(null); }} title="حذف ثبت‌نام" description={deleteItem ? `ثبت‌نام «${deleteItem.studentFirstName} ${deleteItem.studentLastName}» در دوره «${deleteItem.course.title}» حذف شود؟` : ""} confirmLabel="حذف" onConfirm={async () => { if (!deleteItem) return; await removeRegistration(deleteItem); setDeleteItem(null); }} />
    </AdminLayout>
  );
}
