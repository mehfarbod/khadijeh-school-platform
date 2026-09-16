import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminRegistrations() {
  const registrations = useQuery(api.courses.listRegistrations, {});
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">ثبت‌نام دوره‌ها</h1>
        <p className="text-sm text-muted-foreground mt-1">مشاهده ثبت‌نام‌های دوره‌ها</p>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام دانش‌آموز</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">پایه</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام سرپرست</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">تلفن</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {!registrations ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : registrations.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">هنوز ثبت‌نامی ثبت نشده.</td></tr>
            ) : registrations.map((r) => (
              <tr key={r._id} className="border-b border-border/30">
                <td className="px-4 py-3 font-medium">{r.studentFirstName} {r.studentLastName}</td>
                <td className="px-4 py-3">{r.grade}</td>
                <td className="px-4 py-3">{r.guardianName}</td>
                <td className="px-4 py-3">{r.guardianPhone}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
