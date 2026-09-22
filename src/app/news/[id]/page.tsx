import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

interface NewsDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatNewsDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;

  const news = await prisma.news.findUnique({
    where: {
      id,
    },
  });

  if (!news || !news.isActive) {
    return (
      <>
        <Header />

        <main className="bg-[#FAF8F3]">
          <section className="flex min-h-[60vh] items-center justify-center px-5 py-20">
            <div className="max-w-xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5E8] text-xl text-[#194342]">
                !
              </div>

              <h1 className="mt-5 text-xl font-bold text-[#1F2933]">
                خبر موردنظر پیدا نشد
              </h1>

              <p className="mt-2 text-sm leading-7 text-[#667085]">
                ممکن است این خبر حذف شده باشد یا دیگر در دسترس نباشد.
              </p>

              <Link
                href="/news"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#194342] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#194342]/90"
              >
                <ArrowRight className="h-4 w-4" />
                بازگشت به اخبار
              </Link>
            </div>
          </section>
        </main>

        <CoursesFooter />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="bg-[#FAF8F3]">
        <section className="border-b border-[#E1E8D6] bg-[#F1F5E8]">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#194342] transition-colors hover:text-[#B86F5B]"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به اخبار
            </Link>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-6">
            <span className="inline-flex rounded-full bg-[#DBE7C1] px-3 py-1.5 text-xs font-semibold text-[#194342]">
              {news.category}
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-10 text-[#1F2933] sm:text-3xl md:text-4xl">
            {news.title}
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-8 text-[#667085] sm:text-base">
            {news.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-[#E1E8D6] py-4 text-sm text-[#667085]">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#B86F5B]" />
              {formatNewsDate(news.createdAt)}
            </span>

            {news.author && (
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#B86F5B]" />
                {news.author}
              </span>
            )}
          </div>

          {news.coverImage && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-[#E1E8D6] bg-white">
              <img
                src={news.coverImage}
                alt={news.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-[#E1E8D6] bg-white p-6 sm:p-8">
            <div className="whitespace-pre-line text-sm leading-8 text-[#667085] sm:text-base">
              {news.content}
            </div>
          </div>

          {news.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F1F5E8] px-3 py-1.5 text-xs font-medium text-[#194342]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#194342] transition-colors hover:text-[#B86F5B]"
            >
              <ArrowRight className="h-4 w-4" />
              مشاهده سایر اخبار
            </Link>
          </div>
        </article>
      </main>

      <CoursesFooter />
    </>
  );
}
