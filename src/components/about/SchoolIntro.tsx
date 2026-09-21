import {
  BookOpen,
  Heart,
  Lightbulb,
  Shield,
  Users,
} from "lucide-react";

const values = [
  {
    icon: BookOpen,
    title: "آموزش مبتنی بر کاوش",
    description:
      "یادگیری را فراتر از حفظ مطالب می‌دانیم و دانش‌آموزان را به پرسش، کشف و تفکر تشویق می‌کنیم.",
  },
  {
    icon: Heart,
    title: "پرورش شخصیت و اخلاق",
    description:
      "رشد علمی در کنار شکل‌گیری شخصیت، مسئولیت‌پذیری و ارزش‌های اخلاقی دنبال می‌شود.",
  },
  {
    icon: Lightbulb,
    title: "خلاقیت و نوآوری",
    description:
      "دانش‌آموزان فرصت دارند ایده‌های خود را بیان کنند، تجربه کنند و راه‌حل‌های تازه پیدا کنند.",
  },
  {
    icon: Shield,
    title: "محیط امن و حمایتی",
    description:
      "ایجاد محیطی آرام و حمایتگر برای یادگیری، ارتباط و رشد فردی از اصول مهم مدرسه است.",
  },
];

const stats = [
  {
    value: "۳۵۰+",
    label: "دانش‌آموز",
  },
  {
    value: "۲۵+",
    label: "دبیر",
  },
  {
    value: "۹۵٪",
    label: "نرخ قبولی",
  },
  {
    value: "۱۵+",
    label: "سال تجربه",
  },
];

export default function SchoolIntro() {
  return (
    <section className="bg-[#FAF8F3] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
        {/* Introduction */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-[#B86F5B]">
              معرفی مدرسه
            </p>

            <h2 className="max-w-[620px] text-2xl font-bold leading-[1.7] text-[#194342] sm:text-3xl">
              تربیت نسلی متعهد، خلاق و مستقل
            </h2>

            <div className="mt-5 max-w-[650px] space-y-4 text-[13.5px] leading-[2.1] text-[#667085] sm:text-[14px]">
              <p>
                دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف فراهم کردن
                محیطی امن، پویا و الهام‌بخش برای رشد همه‌جانبه دانش‌آموزان
                فعالیت می‌کند.
              </p>

              <p>
                ما باور داریم هر دانش‌آموز ظرفیت‌ها و استعدادهای منحصربه‌فردی
                دارد و آموزش زمانی اثربخش است که در کنار دانش علمی، به رشد
                شخصیت، خلاقیت و مهارت‌های فردی نیز توجه شود.
              </p>

              <p>
                تلاش مجموعه بر این است که مدرسه فضایی برای یادگیری، تجربه،
                مشارکت و شکوفایی استعدادهای دانش‌آموزان باشد.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[14px] bg-[#F1F5E8] px-4 py-6 text-center"
                >
                  <p className="text-2xl font-bold text-[#194342] sm:text-[28px]">
                    {stat.value}
                  </p>

                  <p className="mt-1.5 text-[11.5px] text-[#667085]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-[#BFD7EA] bg-[#BFD7EA]/20 px-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#194342]">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[12.5px] font-semibold text-[#194342]">
                  جامعه‌ای برای رشد و یادگیری
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                  دانش‌آموزان، دبیران و خانواده‌ها در مسیر رشد دانش‌آموزان همراه هستند.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 border-t border-[#DBE7C1] pt-12 sm:mt-20 sm:pt-14">
          <div className="mb-8 max-w-[620px]">
            <p className="mb-3 text-xs font-semibold tracking-wide text-[#B86F5B]">
              ارزش‌های ما
            </p>

            <h2 className="text-2xl font-bold leading-[1.6] text-[#194342]">
              اصولی که مسیر آموزش را شکل می‌دهند
            </h2>

            <p className="mt-3 text-[13px] leading-7 text-[#667085]">
              این ارزش‌ها پایه‌ای برای ایجاد یک تجربه آموزشی متعادل،
              انسانی و هدفمند در مدرسه هستند.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="rounded-[18px] border border-[#DBE7C1] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(25,67,66,0.08)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F5E8] text-[#194342]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-[14px] font-bold text-[#194342]">
                    {value.title}
                  </h3>

                  <p className="mt-2.5 text-[12px] leading-6 text-[#667085]">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}