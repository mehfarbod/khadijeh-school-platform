"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminMessages() {
  const messages = useQuery(api.contactMessages.list, {});
  const markRead = useMutation(api.contactMessages.markRead);
  const removeMessage = useMutation(api.contactMessages.remove);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">پیام‌های تماس</h1>
        <p className="text-sm text-muted-foreground mt-1">پیام‌های دریافتی از فرم تماس</p>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">ایمیل</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">موضوع</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">وضعیت</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
          </tr></thead>
          <tbody>
            {!messages ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-border/30">{[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>)}</tr>
            )) : messages.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">پیامی ثبت نشده.</td></tr>
            ) : messages.map((m) => (
              <tr key={m._id} className={`border-b border-border/30 ${!m.isRead ? "bg-primary/5" : ""}`}>
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3">{m.subject || "—"}</td>
                <td className="px-4 py-3">{m.isRead ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {!m.isRead && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await markRead({ id: m._id }); toast.success("خوانده شد"); }}><MailOpen className="h-3.5 w-3.5" /></Button>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={async () => { await removeMessage({ id: m._id }); toast.success("حذف شد"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
