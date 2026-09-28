import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Announcement = {
  id: string;
  title: string;
  expiresAt: string | null;
};

export default async function AnnouncementTicker() {
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      isTicker: true,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: {
      id: true,
      title: true,
      expiresAt: true,
    },
  });

  const visibleAnnouncements = announcements.filter(
    (item: Announcement) =>
      !item.expiresAt ||
      Number.isNaN(new Date(item.expiresAt).getTime()) ||
      new Date(item.expiresAt).getTime() > Date.now(),
  );

  if (visibleAnnouncements.length === 0) return null;

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
            {[...visibleAnnouncements, ...visibleAnnouncements].map(
              (announcement, index) => (
                <Link
                  key={`${announcement.id}-${index}`}
                  href="/announcements"
                  className="whitespace-nowrap text-xs text-white/80 transition-colors hover:text-white"
                  aria-label={`مشاهده اطلاعیه: ${announcement.title}`}
                >
                  ⬥ {announcement.title}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
