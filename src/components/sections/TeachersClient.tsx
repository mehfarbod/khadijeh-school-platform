"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, BookOpen, Briefcase } from "lucide-react";

const CATEGORIES = ["مدیریت", "دبیران", "مشاوران", "کادر اجرایی"];

const categoryIcons: Record<string, typeof Users> = {
  "مدیریت": Briefcase,
  "دبیران": BookOpen,
  "مشاوران": Users,
  "کادر اجرایی": Users,
};

export default function TeachersClient() {
  const staff = useQuery(api.staff.list, { activeOnly: true });

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-2">
            کادر مدرسه
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            کادر آموزشی و اداری
          </h1>
          <p className="text-sm text-muted-foreground">
            معرفی مدیران، دبیران و کارکنان مدرسه
          </p>
        </div>

        {!staff ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              هنوز کادری ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {CATEGORIES.map((cat) => {
              const members = staff.filter((s) => s.category === cat);
              if (members.length === 0) return null;
              const Icon = categoryIcons[cat] || Users;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">{cat}</h2>
                    <span className="text-xs text-muted-foreground">
                      ({members.length} نفر)
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => (
                      <div
                        key={member._id}
                        className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5">
                            <span className="text-base font-bold text-primary">
                              {member.firstName[0]}{member.lastName[0]}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-rose">{member.position}</p>
                          </div>
                        </div>
                        {member.subject && (
                          <p className="text-xs text-muted-foreground mb-1">
                            درس: {member.subject}
                          </p>
                        )}
                        {member.education && (
                          <p className="text-xs text-muted-foreground">
                            {member.education}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
