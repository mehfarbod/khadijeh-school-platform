import { Link } from "react-router";
import {
  BookOpen, Bell, Calendar, FileText,
  Clock, Newspaper, Phone,
} from "lucide-react";

const items = [
  { icon: BookOpen, label: "ثبت‌نام دوره‌ها", href: "/courses", color: "bg-primary/5 text-primary" },
  { icon: Bell, label: "اطلاعیه‌ها", href: "/announcements", color: "bg-rose/10 text-rose" },
  { icon: Calendar, label: "رویدادهای پیش‌رو", href: "/events", color: "bg-gold/10 text-gold" },
  { icon: FileText, label: "برنامه امتحانات", href: "/exams", color: "bg-navy/10 text-navy" },
  { icon: Clock, label: "برنامه هفتگی", href: "/schedule", color: "bg-primary/5 text-primary" },
  { icon: Newspaper, label: "اخبار مدرسه", href: "/news", color: "bg-rose/10 text-rose" },
  { icon: Phone, label: "تماس با مدرسه", href: "/contact", color: "bg-gold/10 text-gold" },
];

export default function QuickAccess() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-border/60 bg-card p-4 text-center transition-all hover:border-border hover:shadow-sm"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color} transition-transform group-hover:scale-105`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
