import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

const contacts = [
  {
    title: "مدیریت",
    description: "برای مسائل اداری، ثبت‌نام و امور کلی مدرسه",
    department: "management",
    icon: ClipboardList,
    background: "#194342",
    textColor: "#FFFFFF",
    mutedColor: "#FFFFFFBB",
  },
  {
    title: "معاونت",
    description: "موضوعات انضباطی، برنامه‌ریزی و امور دانش‌آموزی",
    department: "deputy",
    icon: CalendarDays,
    background: "#B86F5B",
    textColor: "#FFFFFF",
    mutedColor: "#FFFFFFBB",
  },
  {
    title: "کادر آموزشی",
    description: "مشاوره درسی، پیشرفت تحصیلی و ارتباط با معلمان",
    department: "education",
    icon: BookOpen,
    background: "#DBE7C1",
    textColor: "#17324D",
    mutedColor: "#667085",
  },
];

export default function ContactSection() {
  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-6 py-16">
      <div className="mx-auto max-w-screen-xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-[22px] font-bold text-[#194342]">
            ارتباط با مدرسه
          </h2>

          <p className="mx-auto max-w-[460px] text-[14px] leading-7 text-[#667085]">
            پیام خود را به بخش مربوطه ارسال کنید. همکاران ما در اسرع وقت
            پاسخگوی شما خواهند بود.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {contacts.map((contact) => {
            const Icon = contact.icon;

            return (
              <article
                key={contact.title}
                className="group flex min-h-[260px] flex-col gap-4 rounded-[20px] p-8 transition-transform duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: contact.background,
                }}
              >
                {/* Icon */}
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-white/13">
                  <Icon
                    className="h-[26px] w-[26px]"
                    strokeWidth={1.6}
                    color={contact.textColor}
                  />
                </div>

                {/* Content */}
                <div>
                  <h3
                    className="mb-2 text-[18px] font-bold"
                    style={{
                      color: contact.textColor,
                    }}
                  >
                    {contact.title}
                  </h3>

                  <p
                    className="text-[13px] leading-[1.7]"
                    style={{
                      color: contact.mutedColor,
                    }}
                  >
                    {contact.description}
                  </p>
                </div>

                {/* Action */}
                <Link
                  href={`/contact?department=${contact.department}`}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-[10px] border border-white/20 bg-white/13 px-[18px] py-2.5 text-[13px] font-semibold transition-colors duration-200 hover:bg-white/20"
                  style={{
                    color: contact.textColor,
                  }}
                >
                  <span>ارسال پیام</span>

                  <ArrowLeft
                    className="h-[14px] w-[14px]"
                    strokeWidth={1.6}
                  />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}