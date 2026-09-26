"use client";

import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";

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
    const confirmed = window.confirm(
      `ثبت‌نام «${item.studentFirstName} ${item.studentLastName}» در دوره «${item.course.title}» حذف شود؟`,
    );

    if (!confirmed) return;

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

  return (
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          ثبت‌نام دوره‌ها
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          درخواست‌های ثبت‌نام دوره‌های سایت اصلی را بررسی و مدیریت کنید.
        </p>
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
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-muted-foreground"
                  >
                    هنوز ثبت‌نام دوره‌ای وجود ندارد.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/30 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {item.studentFirstName} {item.studentLastName}
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
                          onClick={() => removeRegistration(item)}
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
  );
}
