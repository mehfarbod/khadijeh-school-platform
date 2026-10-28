"use client";

import { useMemo } from "react";

export type WitnessPointItem = {
  id: number;
  title: string;
  max: number | null;
};

export const WITNESS_POINT_ITEMS: WitnessPointItem[] = [
  { id: 1, title: "فرزندان شهدا، آزادگان و جانبازان ۲۵٪ و بالاتر", max: 5000 },
  { id: 2, title: "دانش‌آموز جانباز", max: 3000 },
  { id: 3, title: "فرزند جانباز تا ۲۵٪", max: 2000 },
  { id: 4, title: "خواهر و برادر شهید و جانباز ۷۰٪ و بالاتر", max: 1000 },
  { id: 5, title: "نوه شهید و نوه جانباز ۷۰٪ و بالاتر (هر مورد ۹۰۰ امتیاز، حداکثر ۱۸۰۰)", max: 1800 },
  { id: 6, title: "فرزند جهادگر و رزمنده بسیجی؛ حضور داوطلبانه در جبهه (هر ماه ۶۰ امتیاز، حداکثر ۹۶ ماه)", max: 2880 },
  { id: 7, title: "فرزند رزمنده جبهه مقاومت (هر ماه ۶۰ امتیاز)", max: null },
  { id: 8, title: "فرزند رزمنده نظامی یا وظیفه؛ حضور در جبهه و مناطق جنگی (هر ماه ۴۰ امتیاز، حداکثر ۹۶ ماه)", max: 2880 },
  { id: 9, title: "مدت حضور در مناطق امنیتی از ۱/۷/۶۷ به بعد (هر ماه ۲٫۵ امتیاز، حداکثر ۹۰ ماه)", max: 225 },
  { id: 10, title: "مدت حضور در مناطق عملیاتی از ۱/۷/۶۷ به بعد (هر ماه ۲ امتیاز، حداکثر ۶۰ ماه)", max: 120 },
  { id: 11, title: "مدت حضور در مناطق امنیتی شمال غرب ایران از ۱/۱/۵۸ تا ۳۱/۶/۵۹ (هر ماه ۱۵ امتیاز، حداکثر ۱۸ ماه)", max: 270 },
  { id: 12, title: "نوه آزاده / نوه جانباز ۵۰ تا ۶۹٪ / نوه آزاده با جانبازی تا ۶۹٪ (هر مورد ۲۰۰ امتیاز)", max: null },
  { id: 13, title: "نوه جانباز تا ۴۹٪ (هر مورد ۱۵۰ امتیاز)", max: null },
  { id: 14, title: "سال‌سه (نتیجه) شهید (هر مورد ۸۰ امتیاز، حداکثر ۲ مورد و جمعاً ۱۶۰)", max: 160 },
  { id: 15, title: "فرزند همسر شهید، آزاده و جانباز بالای ۵۰٪ (۶۰ امتیاز)", max: 60 },
  { id: 16, title: "نوه رزمنده (هر ماه ۹ امتیاز، حداکثر ۲۴ ماه و ۲۱۶ امتیاز)", max: 216 },
  { id: 17, title: "فرزند گروه جهادی شمیم شاهد (هر ماه ۳ امتیاز، حداکثر ۱۰۰ ماه و ۳۰۰ امتیاز)", max: 300 },
  { id: 18, title: "خواهرزاده یا برادرزاده شهید و جانباز ۷۰٪ و بالاتر (هر مورد ۱۵۰ امتیاز)", max: null },
  { id: 19, title: "حفظ قرآن کریم (هر جزء ۲۵ امتیاز، حداکثر ۳۰ جزء و ۷۵۰ امتیاز)", max: 750 },
  { id: 20, title: "مسابقات حفظ، مفاهیم، قرائت قرآن و نهج‌البلاغه — رتبه منطقه‌ای (۱۰ امتیاز، حداکثر ۳۰)", max: 30 },
  { id: 21, title: "مسابقات حفظ، مفاهیم، قرائت قرآن و نهج‌البلاغه — رتبه استانی (۳۰ امتیاز)", max: 30 },
  { id: 22, title: "مسابقات حفظ، مفاهیم، قرائت قرآن و نهج‌البلاغه — رتبه کشوری (۵۰ امتیاز)", max: 50 },
  { id: 23, title: "مسابقات حفظ، مفاهیم، قرائت قرآن و نهج‌البلاغه — رتبه بین‌المللی (۶۰ امتیاز)", max: 60 },
  { id: 24, title: "مسابقات فرهنگی، هنری، ورزشی و علمی — رتبه منطقه‌ای (۱۰ امتیاز، حداکثر ۳۰)", max: 30 },
  { id: 25, title: "مسابقات فرهنگی، هنری، ورزشی و علمی — رتبه استانی (۳۰ امتیاز)", max: 30 },
  { id: 26, title: "مسابقات فرهنگی، هنری، ورزشی و علمی — رتبه کشوری (۵۰ امتیاز)", max: 50 },
  { id: 27, title: "مسابقات فرهنگی، هنری، ورزشی و علمی — رتبه بین‌المللی (۶۰ امتیاز)", max: 60 },
  { id: 28, title: "سابقه خدمت پدر شاغل یا بازنشسته در آموزش و پرورش، بنیاد شهید و مأمور یا انتقالی به سایر ادارات (هر سال ۸ امتیاز)", max: 480 },
  { id: 29, title: "سابقه خدمت مادر شاغل یا بازنشسته در آموزش و پرورش، بنیاد شهید و مأمور یا انتقالی به سایر ادارات (هر سال ۸ امتیاز)", max: 480 },
  { id: 30, title: "سابقه سنوات گذشته خدمت آموزشی پدر در طرح شاهد (هر سال ۸ امتیاز)", max: 300 },
  { id: 31, title: "سابقه سنوات گذشته خدمت آموزشی مادر در طرح شاهد (هر سال ۸ امتیاز)", max: 300 },
  { id: 32, title: "سابقه سنوات گذشته خدمت اداری پدر در طرح شاهد (هر سال ۱۰ امتیاز)", max: 300 },
  { id: 33, title: "سابقه سنوات گذشته خدمت اداری مادر در طرح شاهد (هر سال ۱۰ امتیاز)", max: 300 },
  { id: 34, title: "اشتغال فعلی پدر (کارمند آموزش و پرورش یا بنیاد شهید) در طرح شاهد؛ عوامل اداری (هر ۶ ساعت در هفته ۱۵ امتیاز)", max: null },
  { id: 35, title: "اشتغال فعلی مادر (کارمند آموزش و پرورش یا بنیاد شهید) در طرح شاهد؛ عوامل اداری (هر ۶ ساعت در هفته ۱۵ امتیاز)", max: null },
  { id: 36, title: "اشتغال فعلی پدر (کارمند آموزش و پرورش یا بنیاد شهید) در طرح شاهد؛ عوامل آموزشی (هر ۶ ساعت در هفته ۲۰ امتیاز)", max: null },
  { id: 37, title: "اشتغال فعلی مادر (کارمند آموزش و پرورش یا بنیاد شهید) در طرح شاهد؛ عوامل آموزشی (هر ۶ ساعت در هفته ۲۰ امتیاز)", max: null },
  { id: 38, title: "دانش‌آموز متقاضی ثبت‌نام در مدارس شاهد محل تدریس والدین در سال جاری با حداقل ۱۲ ساعت تدریس (هر ۶ ساعت ۲۵ امتیاز، حداکثر ۱۰۰)", max: 100 },
  { id: 39, title: "پدر کارمند آموزش و پرورش، اشتغال فعلی در مدرسه ایثارگران؛ عوامل آموزشی (هر ۶ ساعت در هفته ۸ امتیاز)", max: null },
  { id: 40, title: "مادر کارمند آموزش و پرورش، اشتغال فعلی در مدرسه ایثارگران؛ عوامل آموزشی (هر ۶ ساعت در هفته ۸ امتیاز)", max: null },
  { id: 41, title: "پدر کارمند آموزش و پرورش، اشتغال فعلی در مدرسه ایثارگران؛ عوامل اداری (هر ۸ ساعت در هفته ۸ امتیاز)", max: null },
  { id: 42, title: "مادر کارمند آموزش و پرورش، اشتغال فعلی در مدرسه ایثارگران؛ عوامل اداری (هر ۸ ساعت در هفته ۸ امتیاز)", max: null },
  { id: 43, title: "سابقه خدمت تمام‌وقت موظف پدر در مدارس ایثارگران (هر سال ۴ امتیاز)", max: null },
  { id: 44, title: "سابقه خدمت تمام‌وقت موظف مادر در مدارس ایثارگران (هر سال ۴ امتیاز)", max: null },
  { id: 45, title: "فرزندان فرهنگیان شاغل به تدریس در مناطق امنیتی در سال تحصیلی ۱۴۰۴-۱۴۰۵ (۱۰۰ امتیاز)", max: 100 },
  { id: 46, title: "امتیاز فرزند و نوه خیر مدرسه‌ساز با تأیید اداره کل نوسازی — احداث و ساخت مدرسه (۱۵۰ امتیاز)", max: 150 },
  { id: 47, title: "امتیاز فرزند و نوه خیر مدرسه‌ساز با تأیید اداره کل نوسازی — اهدای زمین (۱۰۰ امتیاز)", max: 100 },
  { id: 48, title: "تجهیز مدارس شاهد در سال گذشته با تأیید ستاد شاهد استان (۵۰ امتیاز)", max: 50 },
  { id: 49, title: "امتیاز علمی پایه دهم: (معدل × ۴۰) + نمره تراز + ۱۵۰ امتیاز بابت اولویت الف یا ۵۰ امتیاز بابت اولویت ب هدایت تحصیلی", max: null },
  { id: 50, title: "امتیاز معدل میان‌پایه متوسطه اول: (معدل کل × ۴۰) / متوسطه دوم: (معدل سال × ۴۰)", max: null },
];

type Props = {
  values: Record<string, number>;
  onChange: (id: number, value: number) => void;
};

export default function WitnessPointsTable({ values, onChange }: Props) {
  const total = useMemo(
    () => Object.values(values).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0),
    [values],
  );

  const sections = [
    { from: 1, to: 18, title: "ایثارگری و رزمندگی" },
    { from: 19, to: 27, title: "قرآن و مسابقات فرهنگی، هنری، ورزشی و علمی" },
    { from: 28, to: 48, title: "سوابق و امتیازات والدین" },
    { from: 49, to: 50, title: "امتیازات علمی" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
        فقط بندهایی را که شامل وضعیت شما می‌شود تکمیل کنید. برای بندهای فاقد امتیاز، عدد ۰ بگذارید یا آن را خالی بگذارید. متن و سقف هر بند مطابق فرم امتیازبندی ارائه‌شده تنظیم شده است.
      </div>

      {sections.map((section) => (
        <section key={section.title} className="overflow-hidden rounded-2xl border border-[#194342]/10 bg-white">
          <div className="border-b border-[#194342]/10 bg-[#194342]/5 px-4 py-4 sm:px-5">
            <h3 className="font-bold text-[#194342]">{section.title}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-right text-sm">
              <thead>
                <tr className="border-b border-[#194342]/10 text-[#194342]/70">
                  <th className="w-14 px-3 py-3 text-center font-semibold">ردیف</th>
                  <th className="px-3 py-3 font-semibold">عنوان بند امتیاز</th>
                  <th className="w-36 px-3 py-3 font-semibold">حداکثر</th>
                  <th className="w-40 px-3 py-3 font-semibold">امتیاز شما</th>
                </tr>
              </thead>
              <tbody>
                {WITNESS_POINT_ITEMS.filter((item) => item.id >= section.from && item.id <= section.to).map((item) => (
                  <tr key={item.id} className="border-b border-[#194342]/5 last:border-b-0">
                    <td className="px-3 py-4 text-center font-bold text-[#194342]">{item.id}</td>
                    <td className="px-3 py-4 leading-7 text-[#194342]/85">{item.title}</td>
                    <td className="px-3 py-4 text-[#194342]/60">
                      {item.max === null ? "بدون سقف مشخص در فرم" : `${item.max.toLocaleString("fa-IR")} امتیاز`}
                    </td>
                    <td className="px-3 py-4">
                      <input
                        type="number"
                        min={0}
                        max={item.max ?? undefined}
                        step="0.5"
                        inputMode="decimal"
                        value={values[String(item.id)] ?? ""}
                        onChange={(event) => onChange(item.id, Number(event.target.value))}
                        className="w-full rounded-xl border border-[#194342]/15 bg-[#FAF8F3] px-3 py-2.5 text-sm outline-none transition focus:border-[#194342] focus:ring-2 focus:ring-[#194342]/10"
                        placeholder="۰"
                        aria-label={`امتیاز بند ${item.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 rounded-2xl border border-[#194342]/10 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[#194342]/65">مجموع امتیازات واردشده</span>
          <strong className="text-2xl text-[#194342]">{total.toLocaleString("fa-IR")} امتیاز</strong>
        </div>
      </div>
    </div>
  );
}
