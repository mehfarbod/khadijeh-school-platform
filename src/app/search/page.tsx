import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/layout/PublicLayout";

type SearchResult = {
  type: string;
  label: string;
  title: string;
  description: string;
  href: string;
};

function normalizeQuery(value: string) {
  return value
    .trim()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200d]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function searchVariants(query: string) {
  const variants = new Set([query]);
  const arabic = query.replace(/ی/g, "ي").replace(/ک/g, "ك");
  variants.add(arabic);
  return [...variants];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = normalizeQuery(params.q ?? "");
  const variants = searchVariants(query);

  let results: SearchResult[] = [];

  if (query.length >= 2) {
    const contains = (field: string) =>
      variants.map((value) => ({ [field]: { contains: value, mode: "insensitive" as const } }));

    const [news, announcements, events, courses, videos, programs, gallery] =
      await Promise.all([
        prisma.news.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("excerpt"), ...contains("content")],
          },
          select: { slug: true, title: true, excerpt: true, category: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.announcement.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("content")],
          },
          select: { id: true, title: true, content: true, category: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.event.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("description"), ...contains("location")],
          },
          select: { id: true, title: true, description: true, eventType: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.course.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("description"), ...contains("fullDescription"), ...contains("category")],
          },
          select: { slug: true, title: true, description: true, category: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.educationalVideo.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("subject"), ...contains("instructor")],
          },
          select: { slug: true, title: true, subject: true, instructor: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.educationalProgram.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("description"), ...contains("content")],
          },
          select: { type: true, title: true, description: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.galleryItem.findMany({
          where: {
            isActive: true,
            OR: [...contains("title"), ...contains("categoryLabel"), ...contains("description")],
          },
          select: { id: true, title: true, description: true, categoryLabel: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);

    results = [
      ...news.map((item) => ({
        type: "news",
        label: item.category || "خبر",
        title: item.title,
        description: item.excerpt,
        href: `/news/${item.slug}`,
      })),
      ...announcements.map((item) => ({
        type: "announcement",
        label: item.category || "اطلاعیه",
        title: item.title,
        description: item.content,
        href: `/announcements?highlight=${item.id}`,
      })),
      ...events.map((item) => ({
        type: "event",
        label: item.eventType || "رویداد",
        title: item.title,
        description: item.description,
        href: `/events/${item.id}`,
      })),
      ...courses.map((item) => ({
        type: "course",
        label: item.category || "دوره",
        title: item.title,
        description: item.description,
        href: `/courses#${item.slug}`,
      })),
      ...videos.map((item) => ({
        type: "video",
        label: item.subject || "ویدیوی آموزشی",
        title: item.title,
        description: item.instructor ? `مدرس: ${item.instructor}` : "ویدیوی آموزشی",
        href: `/videos/${item.slug}`,
      })),
      ...programs.map((item) => ({
        type: "program",
        label: "برنامه آموزشی",
        title: item.title,
        description: item.description,
        href: `/programs/${item.type}`,
      })),
      ...gallery.map((item) => ({
        type: "gallery",
        label: item.categoryLabel || "گالری",
        title: item.title,
        description: item.description || "تصاویر و فعالیت‌های مدرسه",
        href: `/gallery`,
      })),
    ].slice(0, 50);
  }

  return (
    <PublicLayout>
      <main dir="rtl" className="relative overflow-hidden bg-[#FAF8F5]">
        <section className="relative border-b border-[#E8E2D8] px-5 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#DBE7C1]/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#E9D6C8]/35 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full bg-[#F1F5E8] px-4 py-1.5 text-xs font-semibold text-[#3F5D3E]">
              جست‌وجوی سایت
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#194342] sm:text-4xl">
              چه چیزی می‌خواهید پیدا کنید؟
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#667085] sm:text-base">
              اخبار، اطلاعیه‌ها، رویدادها، دوره‌ها و محتوای آموزشی مدرسه را جست‌وجو کنید.
            </p>

            <form action="/search" className="mx-auto mt-8 max-w-3xl">
              <div className="flex flex-col gap-3 rounded-2xl border border-[#D5DECB] bg-white p-2 shadow-[0_14px_40px_rgba(25,67,66,0.08)] sm:flex-row">
                <div className="flex h-12 flex-1 items-center gap-3 rounded-xl px-4">
                  <Search className="h-5 w-5 shrink-0 text-[#8A9488]" />
                  <input
                    name="q"
                    defaultValue={query}
                    autoComplete="off"
                    placeholder="مثلاً اخبار مدرسه، دوره‌های آموزشی..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#1F2933] outline-none placeholder:text-[#A0A8A0]"
                    dir="rtl"
                    aria-label="عبارت جست‌وجو"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-[#194342] px-7 text-sm font-semibold text-white transition hover:bg-[#3F5D3E] focus:outline-none focus:ring-2 focus:ring-[#C9DDA8] focus:ring-offset-2"
                >
                  جست‌وجو
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {query.length < 2 ? (
              <div className="rounded-2xl border border-[#E1E8D6] bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5E8]">
                  <Search className="h-6 w-6 text-[#3F5D3E]" />
                </div>
                <h2 className="mt-5 text-base font-semibold text-[#194342]">جست‌وجو را شروع کنید</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#667085]">
                  حداقل دو کاراکتر وارد کنید تا نتایج مرتبط با محتوای عمومی سایت نمایش داده شود.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-[#E1E8D6] bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8EDE8]">
                  <Search className="h-6 w-6 text-[#B86F5B]" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-[#194342]">نتیجه‌ای پیدا نشد</h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  برای «{query}» نتیجه‌ای پیدا نکردیم. عبارت دیگری را امتحان کنید.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#B86F5B]">نتایج جست‌وجو</p>
                    <h2 className="mt-1 text-lg font-bold text-[#194342]">
                      {results.length} نتیجه برای «{query}»
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {results.map((result, index) => (
                    <Link
                      key={`${result.type}-${index}-${result.title}`}
                      href={result.href}
                      className="group rounded-2xl border border-[#E1E8D6] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#C9DDA8] hover:shadow-[0_12px_30px_rgba(25,67,66,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="inline-flex rounded-full bg-[#F1F5E8] px-2.5 py-1 text-[10px] font-semibold text-[#3F5D3E]">
                            {result.label}
                          </span>
                          <h3 className="mt-3 text-base font-bold leading-7 text-[#194342] transition-colors group-hover:text-[#3F5D3E]">
                            {result.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667085]">
                            {result.description}
                          </p>
                        </div>
                        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5F0] text-[#667085] transition group-hover:bg-[#DBE7C1] group-hover:text-[#194342]">
                          ←
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}