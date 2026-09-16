import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Cake, Gift } from "lucide-react";

export default function Birthdays() {
  const todayBirthdays = useQuery(api.birthdays.today, {});
  const upcomingBirthdays = useQuery(api.birthdays.upcoming, { limit: 5 });

  // Show the section only if there's data
  const hasData =
    (todayBirthdays && todayBirthdays.length > 0) ||
    (upcomingBirthdays && upcomingBirthdays.length > 0);

  if (!hasData) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose/10">
            <Cake className="h-5 w-5 text-rose" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              امروز تولد چه کسی است؟
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              تولدهای امروز و پیش‌رو
            </p>
          </div>
        </div>

        {/* Today's birthdays */}
        {todayBirthdays && todayBirthdays.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-rose mb-3">تولدهای امروز</p>
            <div className="flex flex-wrap gap-3">
              {todayBirthdays.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center gap-3 rounded-xl border border-rose/20 bg-rose/5 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose/10">
                    <Gift className="h-4 w-4 text-rose" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.firstName}</p>
                    <p className="text-xs text-muted-foreground">{b.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming birthdays */}
        {upcomingBirthdays && upcomingBirthdays.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">تولدهای پیش‌رو</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {upcomingBirthdays.map((b) => (
                <div
                  key={b._id}
                  className="rounded-lg border border-border/60 bg-card p-3 text-center"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mx-auto mb-2">
                    <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{b.firstName}</p>
                  <p className="text-[10px] text-muted-foreground">{b.grade}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
