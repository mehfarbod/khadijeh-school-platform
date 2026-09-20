"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ArrowLeft } from "lucide-react";

const contactItems = [
  {
    icon: Phone,
    label: "تلفن",
    value: "۰۲۱-۸۸۷۷۶۶۵۵",
  },
  {
    icon: Mail,
    label: "ایمیل",
    value: "info@khadijeh-school.ir",
  },
  {
    icon: MapPin,
    label: "آدرس",
    value: "قم، نیروگاه، 20 متری زاد",
  },
];

export default function ContactCTA() {
  return (
    <section className="bg-[#194342] px-6 py-14 text-white md:py-16">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Content */}
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#DBE7C1]">
              ارتباط با ما
            </p>

            <h2 className="mb-4 text-[22px] font-bold leading-[1.5] md:text-[26px]">
              سوالی دارید؟ با ما در تماس باشید
            </h2>

            <p className="mb-6 max-w-[520px] text-[13px] leading-[1.9] text-white/70">
              برای ارتباط با مدرسه، دریافت اطلاعات و هماهنگی مراجعه، می‌توانید
              از راه‌های زیر با ما در تماس باشید.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#B86F5B] px-[18px] py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#A45F4D]"
            >
              <span>تماس با مدرسه</span>
              <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={1.7} />
            </Link>
          </div>

          {/* Contact information */}
          <div className="grid gap-3">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#DBE7C1]/10">
                    <Icon
                      className="h-[17px] w-[17px] text-[#DBE7C1]"
                      strokeWidth={1.6}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-0.5 text-[10px] text-white/50">
                      {item.label}
                    </p>

                    <p className="truncate text-[13px] text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
