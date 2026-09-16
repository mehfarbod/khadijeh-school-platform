"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ArrowLeft } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="py-12 md:py-16 bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">
              ارتباط با ما
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              سوالی دارید؟ با ما در تماس باشید
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              کارشناسان ما آماده پاسخگویی به سوالات شما درباره ثبت‌نام، دوره‌ها و فعالیت‌های مدرسه هستند.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
            >
              تماس با مدرسه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {[
              { icon: Phone, label: "تلفن", value: "۰۲۱-۸۸۷۷۶۶۵۵" },
              { icon: Mail, label: "ایمیل", value: "info@khadijeh-school.ir" },
              { icon: MapPin, label: "آدرس", value: "تهران، خیابان ولیعصر، نبش کوچه گل" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <item.icon className="h-4 w-4 text-gold shrink-0" />
                <div>
                  <p className="text-[10px] text-white/50">{item.label}</p>
                  <p className="text-sm text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
