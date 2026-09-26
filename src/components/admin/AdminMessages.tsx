"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);

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

  const handleMarkRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRead: true,
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در تغییر وضعیت پیام");
      }

      toast.success("خوانده شد");
      await loadMessages();
    } catch (error) {
      console.error(error);
      toast.error("تغییر وضعیت پیام انجام نشد");
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
      await loadMessages();
    } catch (error) {
      console.error(error);
      toast.error("حذف پیام انجام نشد");
    }
  };

  return (
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          پیام‌های تماس
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          پیام‌های دریافتی از فرم تماس
        </p>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                نام
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                ایمیل
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                موضوع
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                وضعیت
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                عملیات
              </th>
            </tr>
          </thead>

          <tbody>
            {!messages ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border/30"
                >
                  {[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : messages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
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
                  <td className="px-4 py-3 font-medium">
                    {message.name}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {message.email}
                  </td>

                  <td className="px-4 py-3">
                    {message.subject || "—"}
                  </td>

                  <td className="px-4 py-3">
                    {message.isRead ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary" />
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!message.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleMarkRead(message.id)
                          }
                        >
                          <MailOpen className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() =>
                          handleDelete(message.id)
                        }
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
  );
}