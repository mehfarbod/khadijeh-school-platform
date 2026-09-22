"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

function getCategoryColor(category: string) {
  switch (category) {
    case "اطلاعیه":
      return "#194342";

    case "خبر":
      return "#17324D";

    case "برنامه":
      return "#7C5CBF";

    case "رویداد":
      return "#D97706";

    default:
      return "#194342";
  }
}

function formatNewsDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setError(false);

        const response = await fetch("/api/news");

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data: NewsItem[] = await response.json();

        if (!cancelled) {
          setNews(data);
        }
      } catch (error) {
        console.error("Failed to load news:", error);

        if (!cancelled) {
          setNews([]);
          setError(true);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!news) {
    return (
      <section className="bg-[#FAF8F3] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl bg-[#E9EDE1]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-lg font-bold text-[#1F2933]">
            دریافت اخبار با مشکل مواجه شد
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#667085]">
            لطفاً کمی بعد دوباره تلاش کنید.
          </p>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="bg-[#FAF8F3] py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5E8]">
            <span className="text-xl text-[#194342]">○</span>
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#1F2933]">
            هنوز خبری منتشر نشده است
          </h2>

          <p className="mt-2 text-sm leading-7 text-[#667085]">
            به‌محض انتشار خبر جدید، اطلاعات آن در این بخش نمایش داده می‌شود.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAF8F3] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wider text-[#B86F5B]">
            اطلاع‌رسانی مدرسه
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#1F2933] sm:text-2xl">
            آخرین اخبار
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
            آخرین اخبار، اطلاعیه‌ها و برنامه‌های مدرسه را از اینجا دنبال کنید.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => {
            const categoryColor = getCategoryColor(item.category);

            return (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="group block rounded-[18px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#194342]/40"
              >
                <article className="h-full overflow-hidden rounded-[18px] border border-[#DBE7C1] bg-white transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <div
                    className="h-1"
                    style={{
                      backgroundColor: categoryColor,
                    }}
                  />

                  {item.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden bg-[#F1F5E8]">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}

                  <div className="px-[22px] py-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className="rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                        style={{
                          backgroundColor: `${categoryColor}18`,
                          color: categoryColor,
                        }}
                      >
                        {item.category}
                      </span>

                      <span className="text-[11px] text-[#667085]">
                        {formatNewsDate(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="mb-2 text-[14px] font-bold leading-[1.7] text-[#1F2933] transition-colors group-hover:text-[#194342]">
                      {item.title}
                    </h3>

                    <p className="mb-4 line-clamp-3 text-[12.5px] leading-[1.8] text-[#667085]">
                      {item.excerpt}
                    </p>

                    <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[#194342]">
                      <span>ادامه مطلب</span>
                      <ArrowLeft className="h-[13px] w-[13px]" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
