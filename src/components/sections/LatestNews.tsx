import { ArrowLeft } from "lucide-react";

const news = [
  {
    category: "اطلاعیه",
    title: "آغاز ثبت‌نام دوره‌های تقویتی زمستان ۱۴۰۳",
    excerpt:
      "دانش‌آموزان عزیز می‌توانند از تاریخ ۱۵ دی ماه برای دوره‌های تقویتی نام‌نویسی کنند.",
    date: "۲ مهر ۱۴۰۳",
    categoryColor: "#194342",
  },
  {
    category: "خبر",
    title: "درخشش دانش‌آموزان در المپیاد علمی استان",
    excerpt:
      "سه دانش‌آموز مدرسه موفق به کسب مقام برتر در المپیاد علمی استانی شدند.",
    date: "۲۸ شهریور ۱۴۰۳",
    categoryColor: "#17324D",
  },
  {
    category: "برنامه",
    title: "برگزاری کارگاه مهارت‌های ارتباطی برای والدین",
    excerpt:
      "مدرسه میزبان کارگاه تخصصی مهارت‌های ارتباطی برای اولیای دانش‌آموزان خواهد بود.",
    date: "۲۰ شهریور ۱۴۰۳",
    categoryColor: "#7C5CBF",
  },
  {
    category: "رویداد",
    title: "جشن آغاز سال تحصیلی جدید",
    excerpt:
      "مراسم گرامیداشت آغاز سال تحصیلی با حضور دانش‌آموزان، اولیا و کادر آموزشی برگزار شد.",
    date: "۱۰ شهریور ۱۴۰۳",
    categoryColor: "#D97706",
  },
];

export default function LatestNews() {
  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-6 py-16">
      <div className="mx-auto max-w-screen-xl">
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-[22px] font-bold text-[#194342]">
              آخرین اخبار و اطلاعیه‌ها
            </h2>

            <p className="text-[13px] text-[#667085]">
              از رویدادها و برنامه‌های جاری مدرسه مطلع بمانید
            </p>
          </div>

          <a
            href="/news"
            className="flex items-center gap-1 text-[13px] font-semibold text-[#194342] transition-opacity duration-200 hover:opacity-70"
          >
            <span>همه اخبار</span>
            <ArrowLeft className="h-4 w-4" />
          </a>
        </div>

        {/* News Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[18px] border border-[#DBE7C1] bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              {/* Category Color Bar */}
              <div
                className="h-1"
                style={{
                  backgroundColor: item.categoryColor,
                }}
              />

              <div className="px-[22px] py-5">
                {/* Category + Date */}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                    style={{
                      backgroundColor: `${item.categoryColor}18`,
                      color: item.categoryColor,
                    }}
                  >
                    {item.category}
                  </span>

                  <span className="text-[11px] text-[#667085]">
                    {item.date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-[14px] font-bold leading-[1.6] text-[#1F2933]">
                  {item.title}
                </h3>

                {/* Excerpt */}
                <p className="mb-4 text-[12.5px] leading-[1.8] text-[#667085]">
                  {item.excerpt}
                </p>

                {/* Read More */}
                <a
                  href="#"
                  className="flex items-center gap-1 text-[12.5px] font-semibold text-[#194342] transition-opacity duration-200 hover:opacity-70"
                >
                  <span>ادامه مطلب</span>
                  <ArrowLeft className="h-[13px] w-[13px]" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}