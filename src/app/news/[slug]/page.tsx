import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";

type News = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string | null;
  category: string;
  tags: string[];
  createdAt: string;
};

async function getNews(slug: string): Promise<News | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/news/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;
  return response.json();
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) notFound();

  const date = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(news.createdAt));

  return (
    <>
      <Header />
      <main className="bg-[#FAF8F3]">
        <section className="bg-[#194342]">
          <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm text-[#DBE7C1] hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به اخبار
            </Link>
            <div className="mt-8 max-w-4xl">
              <span className="rounded-full bg-[#DBE7C1]/15 px-3 py-1.5 text-xs font-medium text-[#DBE7C1]">
                {news.category}
              </span>
              <h1 className="mt-5 text-2xl font-bold leading-[1.8] text-white sm:text-4xl">
                {news.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/65">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {date}
                </span>
                {news.author && <span>نویسنده: {news.author}</span>}
              </div>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
          {news.coverImage && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#DBE7C1] bg-white">
              <img
                src={news.coverImage}
                alt={news.title}
                className="aspect-[16/8] w-full object-cover"
              />
            </div>
          )}

          <p className="mb-7 text-base font-medium leading-8 text-[#475467]">
            {news.excerpt}
          </p>

          <div className="rounded-2xl border border-[#DBE7C1] bg-white p-6 sm:p-9">
            <div className="whitespace-pre-line text-sm leading-[2.2] text-[#344054] sm:text-base">
              {news.content}
            </div>
          </div>

          {news.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F1F5E8] px-3 py-1 text-xs text-[#194342]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>
      <CoursesFooter />
    </>
  );
}
