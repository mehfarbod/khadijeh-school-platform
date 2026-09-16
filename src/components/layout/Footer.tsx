"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                خ
              </div>
              <p className="text-sm font-bold text-foreground leading-tight">
                دبیرستان شاهد حضرت خدیجه (ص)
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              محیطی امن و الهام‌بخش برای رشد علمی، اخلاقی و خلاقانه دانش‌آموزان.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">دسترسی سریع</h3>
            <ul className="space-y-2">
              {[
                { label: "دوره‌ها", href: "/courses" },
                { label: "اخبار", href: "/news" },
                { label: "رویدادها", href: "/events" },
                { label: "اعلامیه‌ها", href: "/announcements" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">مدرسه</h3>
            <ul className="space-y-2">
              {[
                { label: "درباره مدرسه", href: "/about" },
                { label: "کادر مدرسه", href: "/teachers" },
                { label: "دانش‌آموزان", href: "/students" },
                { label: "سوالات متداول", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>تهران، خیابان ولیعصر، نبش کوچه گل</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>۰۲۱-۸۸۷۷۶۶۵۵</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@khadijeh-school.ir</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © ۱۴۰۵ دبیرستان دخترانه شاهد حضرت خدیجه (ص). تمامی حقوق محفوظ است.
          </p>
          <Link href="/auth" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ورود به پنل مدیریت
          </Link>
        </div>
      </div>
    </footer>
  );
}
