import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

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
    <main dir="rtl" className="min-h-[70vh] bg-[#FAF8F5] px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold text-[#B86F5B]">جست‌وجوی سایت</p>
          <h1 className="text-2xl font-bold text-[#194342] sm:text-3xl">نتایج جست‌وجو</h1>
          <p className="mt-2 text-sm text-[#667085]">
            {query ? `نتایج مرتبط با «${query}»` : "عبارت موردنظر خود را جست‌وجو کنید."}
          </p>
        </div>

        <form action="/search" className="mb-8 flex gap-2">
          <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-[#D5DECB] bg-white px-4 shadow-sm">
            <Search className="h-5 w-5 shrink-0 text-[#667085]" />
            <input
              name="q"
              defaultValue={query}
              placeholder="مثلاً اخبار، دوره، برنامه هفتگی..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1F2933] outline-none"
              dir="rtl"
            />
          </div>
          <button className="h-12 rounded-xl bg-[#194342] px-6 text-sm font-medium text-white transition hover:bg-[#3F5D3E]">
            جست‌وجو
          </button>
        </form>

        {query.length < 2 ? (
          <div className="rounded-2xl border border-dashed border-[#D5DECB] bg-white p-10 text-center text-sm text-[#667085]">
            برای جست‌وجو حداقل دو کاراکتر وارد کنید.
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-[#E1E8D6] bg-white p-10 text-center">
            <p className="font-medium text-[#194342]">نتیجه‌ای پیدا نشد.</p>
            <p className="mt-2 text-sm text-[#667085]">عبارت دیگری را امتحان کنید.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <Link
                key={`${result.type}-${index}-${result.title}`}
                href={result.href}
                className="block rounded-2xl border border-[#E1E8D6] bg-white p-5 transition hover:border-[#C9DDA8] hover:shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-[#F1F5E8] px-2.5 py-1 text-[10px] font-semibold text-[#194342]">
                    {result.label}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-[#194342]">{result.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667085]">
                  {result.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
