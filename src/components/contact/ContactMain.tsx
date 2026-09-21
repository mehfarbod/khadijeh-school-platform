"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

type Department =
  | "management"
  | "deputy"
  | "education";

const contactInfo = [
  {
    icon: MapPin,
    title: "آدرس مدرسه",
    value:
      "تهران، خیابان نمونه، کوچه مدرسه، دبیرستان شاهد حضرت خدیجه (س)",
  },
  {
    icon: Phone,
    title: "شماره تماس",
    value: "۰۲۱-۱۲۳۴۵۶۷۸",
  },
  {
    icon: Mail,
    title: "ایمیل",
    value: "info@khadijeh-school.ir",
  },
  {
    icon: Clock3,
    title: "ساعات پاسخگویی",
    value: "شنبه تا چهارشنبه، ۸:۰۰ تا ۱۴:۰۰",
  },
];

const subjects = [
  "اطلاعات عمومی مدرسه",
  "ثبت‌نام و پذیرش",
  "دوره‌های آموزشی",
  "امور دانش‌آموزی",
  "سایر",
];

const departmentLabels: Record<Department, string> = {
  management: "مدیریت",
  deputy: "معاونت",
  education: "کادر آموزشی",
};

export default function ContactMain() {
  const searchParams = useSearchParams();

  const departmentFromUrl = searchParams.get("department");

  const initialDepartment: Department | "" =
    departmentFromUrl === "management" ||
    departmentFromUrl === "deputy" ||
    departmentFromUrl === "education"
      ? departmentFromUrl
      : "";

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | "">(initialDepartment);

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  }

  return (
    <section className="bg-[#FAF8F3] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          {/* Contact Information */}
          <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-6 sm:p-7">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-[#B86F5B]">
                راه‌های ارتباطی
              </p>

              <h2 className="text-2xl font-bold leading-[1.6] text-[#194342]">
                با مدرسه در ارتباط باشید
              </h2>

              <p className="mt-3 text-[13px] leading-7 text-[#667085]">
                برای دریافت اطلاعات بیشتر یا پیگیری امور مختلف،
                می‌توانید از راه‌های ارتباطی زیر با مدرسه تماس بگیرید.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {contactInfo.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-3.5 rounded-[14px] border border-[#EEF2E6] bg-[#F8FAF4] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#194342]">
                      <Icon
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#194342]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[11.5px] leading-6 text-[#667085]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-6 sm:p-7">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-[#B86F5B]">
                ارسال پیام
              </p>

              <h2 className="text-2xl font-bold leading-[1.6] text-[#194342]">
                {selectedDepartment
                  ? `ارسال پیام به ${departmentLabels[selectedDepartment]}`
                  : "پیام خود را برای ما ارسال کنید"}
              </h2>

              <p className="mt-3 text-[13px] leading-7 text-[#667085]">
                فرم زیر را تکمیل کنید تا پیام شما به بخش موردنظر
                ارسال شود.
              </p>
            </div>

            {isSubmitted ? (
              <div className="mt-8 rounded-[16px] border border-[#DBE7C1] bg-[#F1F5E8] px-5 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#194342]">
                  <Send className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-[15px] font-bold text-[#194342]">
                  پیام شما با موفقیت ثبت شد
                </h3>

                <p className="mt-2 text-[12px] leading-6 text-[#667085]">
                  در حال حاضر این فرم به‌صورت آزمایشی عمل می‌کند.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="mb-2 block text-[12px] font-medium text-[#194342]"
                  >
                    مقصد پیام
                  </label>

                  <select
                    id="department"
                    name="department"
                    required
                    value={selectedDepartment}
                    onChange={(event) =>
                      setSelectedDepartment(
                        event.target.value as Department
                      )
                    }
                    className="h-11 w-full rounded-[11px] border border-[#DCE5D4] bg-[#FAF8F3] px-3.5 text-[12px] text-[#1F2933] outline-none focus:border-[#194342]"
                  >
                    <option value="" disabled>
                      انتخاب واحد موردنظر
                    </option>

                    <option value="management">
                      مدیریت
                    </option>

                    <option value="deputy">
                      معاونت
                    </option>

                    <option value="education">
                      کادر آموزشی
                    </option>
                  </select>
                </div>

                {/* Name + Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-[12px] font-medium text-[#194342]"
                    >
                      نام و نام خانوادگی
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="نام و نام خانوادگی"
                      className="h-11 w-full rounded-[11px] border border-[#DCE5D4] bg-[#FAF8F3] px-3.5 text-[12px] text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#194342]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-[12px] font-medium text-[#194342]"
                    >
                      شماره تماس
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="شماره تماس"
                      className="h-11 w-full rounded-[11px] border border-[#DCE5D4] bg-[#FAF8F3] px-3.5 text-[12px] text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#194342]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-[12px] font-medium text-[#194342]"
                  >
                    موضوع پیام
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    required
                    defaultValue=""
                    className="h-11 w-full rounded-[11px] border border-[#DCE5D4] bg-[#FAF8F3] px-3.5 text-[12px] text-[#1F2933] outline-none focus:border-[#194342]"
                  >
                    <option value="" disabled>
                      انتخاب موضوع
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[12px] font-medium text-[#194342]"
                  >
                    متن پیام
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="پیام خود را بنویسید..."
                    className="w-full resize-none rounded-[11px] border border-[#DCE5D4] bg-[#FAF8F3] px-3.5 py-3 text-[12px] leading-6 text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#194342]"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[#194342] px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#153938]"
                >
                  <Send className="h-4 w-4" />
                  ارسال پیام
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}