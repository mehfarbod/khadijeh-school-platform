import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { Pin, ArrowLeft, Bell } from "lucide-react";
import { toPersianNumber } from "@/lib/persian";

export default function AnnouncementsPreview() {
  const announcements = useQuery(api.announcements.list, {});

  if (!announcements) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-2">
              اعلامیه‌ها
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              اطلاعیه‌های مهم
            </h2>
          </div>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {announcements.slice(0, 4).map((item) => (
            <div
              key={item._id}
              className="flex items-start gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                {item.isPinned ? (
                  <Pin className="h-4 w-4 text-primary" />
                ) : (
                  <Bell className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {item.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.content}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
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
