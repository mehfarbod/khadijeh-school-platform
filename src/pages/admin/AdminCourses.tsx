"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen } from "lucide-react";

export default function AdminCourses() {
  const courses = useQuery(api.courses.list, {});
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">دوره‌ها</h1>
        <p className="text-sm text-muted-foreground mt-1">مدیریت دوره‌های آموزشی</p>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">عنوان</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">وضعیت</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">ظرفیت</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">ثبت‌نام</th>
            </tr>
          </thead>
          <tbody>
            {!courses ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : courses.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground"><BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />هنوز دوره‌ای ثبت نشده.</td></tr>
            ) : courses.map((c) => (
              <tr key={c._id} className="border-b border-border/30">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary/5 text-primary px-2 py-0.5 text-xs">{c.status}</span></td>
                <td className="px-4 py-3">{c.capacity}</td>
                <td className="px-4 py-3">{c.currentRegistrations}/{c.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
