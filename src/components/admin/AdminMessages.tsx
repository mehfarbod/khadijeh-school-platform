"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, MailOpen, X } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  department: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const departmentLabels: Record<string, string> = {
  management: "مدیریت",
  deputy: "معاونت",
  education: "کادر آموزشی",
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/contact-messages");

      if (!response.ok) {
        throw new Error("خطا در دریافت پیام‌ها");
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
      toast.error("دریافت پیام‌ها با خطا مواجه شد");
      setMessages([]);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleView = async (message: ContactMessage) => {
    setSelectedMessage(message);

    if (!message.isRead) {
      try {
        const response = await fetch(`/api/contact-messages/${message.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true }),
        });

        if (response.ok) {
          setMessages((current) =>
            current?.map((item) =>
              item.id === message.id ? { ...item, isRead: true } : item,
            ) ?? null,
          );
          setSelectedMessage((current) =>
            current ? { ...current, isRead: true } : null,
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف پیام");
      }

      toast.success("حذف شد");
      setSelectedMessage(null);
      await loadMessages();
    } catch (error) {
      console.error(error);
      toast.error("حذف پیام انجام نشد");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">پیام‌های تماس</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          پیام‌های دریافتی از فرم تماس
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">نام</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">شماره تماس</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">مقصد</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">موضوع</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">وضعیت</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {!messages ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  پیامی ثبت نشده.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr
                  key={message.id}
                  className={`border-b border-border/30 ${
                    !message.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{message.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {message.phone || message.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {message.department
                      ? departmentLabels[message.department] || message.department
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{message.subject || "—"}</td>
                  <td className="px-4 py-3">
                    {message.isRead ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleView(message)}
                      >
                        مشاهده پیام
                      </Button>

                      {!message.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleView(message)}
                        >
                          <MailOpen className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(message.id)}
                      >
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

      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMessage(null);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">پیام دریافتی</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">
                  {selectedMessage.subject || "بدون موضوع"}
                </h2>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setSelectedMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">نام و نام خانوادگی</p>
                <p className="mt-1 text-sm font-medium">{selectedMessage.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">شماره تماس</p>
                <p className="mt-1 text-sm font-medium">{selectedMessage.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مقصد پیام</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedMessage.department
                    ? departmentLabels[selectedMessage.department] ||
                      selectedMessage.department
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">تاریخ ثبت</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(selectedMessage.createdAt).toLocaleString("fa-IR")}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground">متن پیام</p>
              <div className="mt-2 min-h-32 whitespace-pre-wrap rounded-xl border border-border/60 bg-muted/20 p-4 text-sm leading-7 text-foreground">
                {selectedMessage.message}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}