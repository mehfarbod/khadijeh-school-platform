"use client";

const announcements = [
  "ثبت‌نام دوره‌های آموزشی ترم جدید آغاز شد",
  "برنامه امتحانات نیمسال اول منتشر شد",
  "جلسه اولیا و مربیان روز سه‌شنبه برگزار می‌شود",
];

export default function AnnouncementTicker() {
  return (
    <section
      aria-label="اطلاعیه‌های مهم"
      className="w-full overflow-hidden bg-[#153A39] text-white"
    >
      <div className="mx-auto flex h-10 max-w-[1440px] items-center px-4 lg:px-6">
        <div className="shrink-0 border-l border-white/15 pl-4">
          <span className="whitespace-nowrap text-xs font-semibold text-white">
            اطلاعیه‌های مهم
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-16 pr-8">
            {[...announcements, ...announcements].map((announcement, index) => (
           <span
  key={`${announcement}-${index}`}
  className="whitespace-nowrap text-xs text-white/80"
>
  ⬥ {announcement}
</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker 24s linear infinite;
        }

        @keyframes ticker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(50%);
          }
        }
      `}</style>
    </section>
  );
}