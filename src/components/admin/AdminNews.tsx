"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string | null;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNews() {
  const [news, setNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch("/api/news");

        if (!response.ok) {
          throw new Error("خطا در دریافت اخبار");
        }

        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error("Failed to load news:", error);
        setNews([]);
      }
    };

    loadNews();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">اخبار</h1>

        <p className="text-sm text-muted-foreground mt-1">مدیریت اخبار مدرسه</p>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                عنوان
              </th>

              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                دسته‌بندی
              </th>

              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                ویژه
              </th>
            </tr>
          </thead>

          <tbody>
            {!news ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : news.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  <Newspaper className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  هنوز خبری ثبت نشده.
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id} className="border-b border-border/30">
                  <td className="px-4 py-3 font-medium">{item.title}</td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {item.category}
                    </span>
                  </td>

                  <td className="px-4 py-3">{item.isFeatured ? "✓" : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
