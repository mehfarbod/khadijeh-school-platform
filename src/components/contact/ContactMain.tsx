"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react";

type Department = "management" | "deputy" | "education";

const contactInfo = [
  {
    icon: MapPin,
    title: "آدرس مدرسه",
    value: "تهران، خیابان نمونه، کوچه مدرسه، دبیرستان شاهد حضرت خدیجه (س)",
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

function ContactMainContent() {
  const searchParams = useSearchParams();

  const departmentFromUrl = searchParams?.get("department");

  const initialDepartment: Department | "" =
    departmentFromUrl === "management" ||
    departmentFromUrl === "deputy" ||
    departmentFromUrl === "education"
      ? departmentFromUrl
      : "";

  const [selectedDepartment, setSelectedDepartment] = useState<Department | "">(
    initialDepartment,
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const name = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[\s-]/g, "");
    const department = String(formData.get("department") ?? "");
    const subject = String(formData.get("subject") ?? "");
    const message = String(formData.get("message") ?? "").trim();
    if (!department) nextErrors.department = "لطفاً مقصد پیام را انتخاب کنید.";
    if (!name) nextErrors.fullName = "نام و نام خانوادگی الزامی است.";
    else if (name.length < 3) nextErrors.fullName = "نام و نام خانوادگی معتبر نیست.";
    if (!phone) nextErrors.phone = "شماره تماس الزامی است.";
    else if (!/^09\d{9}$/.test(phone)) nextErrors.phone = "شماره تلفن همراه معتبر نیست.";
    if (!subject) nextErrors.subject = "موضوع پیام را انتخاب کنید.";
    if (!message) nextErrors.message = "متن پیام الزامی است.";
    else if (message.length < 5) nextErrors.message = "متن پیام باید حداقل ۵ کاراکتر باشد.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          department,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "ثبت پیام انجام نشد.");
      }

      setIsSubmitted(true);
      form.reset();
      setSelectedDepartment("");
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "ثبت پیام انجام نشد.");
    } finally {
      setIsSubmitting(false);
    }
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
                برای دریافت اطلاعات بیشتر یا پیگیری امور مختلف، می‌توانید از
                راه‌های ارتباطی زیر با مدرسه تماس بگیرید.
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
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
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
                فرم زیر را تکمیل کنید تا پیام شما به بخش موردنظر ارسال شود.
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
                  پیام شما برای بررسی در پنل مدیریت ثبت شد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
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
                      setSelectedDepartment(event.target.value as Department)
                    }
                    className="h-11 w-full rounded-[11px] border border-[#DCE5D4] bg-[#FAF8F3] px-3.5 text-[12px] text-[#1F2933] outline-none focus:border-[#194342]"
                  >
                    <option value="" disabled>
                      انتخاب واحد موردنظر
                    </option>

                    <option value="management">مدیریت</option>

                    <option value="deputy">معاونت</option>

                    <option value="education">کادر آموزشی</option>
                  </select>
                  {errors.department && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.department}</p>}
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
                    {errors.fullName && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.fullName}</p>}
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
                    {errors.phone && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.phone}</p>}
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
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.subject}</p>}
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
                  {errors.message && <p className="mt-1.5 text-[11.5px] text-red-500">{errors.message}</p>}
                </div>

                {submitError && (
                  <p className="text-center text-xs text-red-600">{submitError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[#194342] px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#153938]"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "در حال ارسال..." : "ارسال پیام"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactMainFallback() {
  return (
    <section className="flex min-h-[500px] items-center justify-center bg-[#FAF8F3] px-5">
      <div className="h-10 w-10 animate-pulse rounded-full bg-[#DBE7C1]" />
    </section>
  );
}

export default function ContactMain() {
  return (
    <Suspense fallback={<ContactMainFallback />}>
      <ContactMainContent />
    </Suspense>
  );
}
