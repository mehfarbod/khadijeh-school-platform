import { Link } from "react-router";
import { ArrowLeft, BookOpen, Heart, Lightbulb, Shield } from "lucide-react";

export default function SchoolIntro() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold text-rose uppercase tracking-wider mb-3">
              درباره مدرسه
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
              تربیت نسلی متعهد، خلاق و مستقل
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              دبیرستان دخترانه شاهد حضرت خدیجه (ص) با بیش از ۱۵ سال سابقه آموزشی،
              محیطی امن و الهام‌بخش برای رشد همه‌جانبه دانش‌آموزان فراهم می‌آورد.
              ما باور داریم هر دانش‌آموز ظرفیت‌های منحصربه‌فردی دارد که باید پرورش یابد.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { icon: BookOpen, text: "آموزش مبتنی بر کاوش" },
                { icon: Heart, text: "پرورش شخصیت و اخلاق" },
                { icon: Lightbulb, text: "پرورش خلاقیت و نوآوری" },
                { icon: Shield, text: "محیط امن و حمایتی" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <item.icon className="h-4 w-4 text-rose shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              مطالعه بیشتر درباره مدرسه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "۳۵۰+", label: "دانش‌آموز" },
                  { value: "۲۵+", label: "دبیر" },
                  { value: "۹۵٪", label: "نرخ قبولی" },
                  { value: "۱۵+", label: "سال تجربه" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
