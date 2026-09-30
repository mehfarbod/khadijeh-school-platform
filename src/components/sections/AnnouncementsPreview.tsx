import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Pin, ArrowLeft, Bell } from "lucide-react";
import { toPersianNumber } from "@/lib/persian";

export default async function AnnouncementsPreview() {
  const queryStart = performance.now();
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date().toISOString() } }],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 4,
  })

  console.log(
    `[Home] AnnouncementsPreview Prisma: ${(performance.now() - queryStart).toFixed(0)}ms`,
  );;

  if (announcements.length === 0) return null;

  return (
    <section className="bg-muted/30 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose">اعلامیه‌ها</p>
            <h2 className="text-xl font-bold text-foreground md:text-2xl">اطلاعیه‌های مهم</h2>
          </div>
          <Link href="/announcements" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {announcements.map((item) => (
            <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                {item.isPinned ? <Pin className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{item.category}</span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.content}</p>
                <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                  {toPersianNumber(new Date(item.createdAt).toLocaleDateString("fa-IR"))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
