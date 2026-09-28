import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  createdAt: Date;
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

function formatNewsDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function LatestNews() {
  const news = await prisma.news.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      createdAt: true,
    },
  });

  if (news.length === 0) return null;

  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-5 py-14 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-[22px] font-bold text-[#194342]">
              آخرین اخبار و اطلاعیه‌ها
            </h2>
            <p className="text-[13px] text-[#667085]">
              از رویدادها و برنامه‌های جاری مدرسه مطلع بمانید
            </p>
          </div>

          <Link
            href="/news"
            className="flex items-center gap-1 text-[13px] font-semibold text-[#194342] transition-opacity duration-200 hover:opacity-70"
          >
            <span>همه اخبار</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((item: NewsItem) => {
            const categoryColor = getCategoryColor(item.category);

            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#194342]/40"
              >
                <article className="h-full overflow-hidden rounded-2xl border border-[#DBE7C1] bg-white transition-shadow duration-200 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <div className="h-1" style={{ backgroundColor: categoryColor }} />
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

                    <h3 className="mb-2 text-[14px] font-bold leading-[1.6] text-[#1F2933] transition-colors group-hover:text-[#194342]">
                      {item.title}
                    </h3>

                    <p className="mb-4 line-clamp-3 text-[12.5px] leading-[1.8] text-[#667085]">
                      {item.excerpt}
                    </p>

                    <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[#194342] transition-opacity duration-200 group-hover:opacity-70">
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
