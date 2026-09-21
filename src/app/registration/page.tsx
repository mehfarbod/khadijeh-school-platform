"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";

type FormErrors = {
  fullName?: string;
  grade?: string;
  guardianName?: string;
  phone?: string;
};

export default function RegistrationPage() {
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "نام و نام خانوادگی دانش‌آموز را وارد کنید.";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "نام واردشده معتبر نیست.";
    }

    if (!grade) {
      newErrors.grade = "پایه موردنظر را انتخاب کنید.";
    }

    if (!guardianName.trim()) {
      newErrors.guardianName = "نام و نام خانوادگی ولی را وارد کنید.";
    } else if (guardianName.trim().length < 3) {
      newErrors.guardianName = "نام واردشده معتبر نیست.";
    }

    const normalizedPhone = phone
      .replace(/[۰-۹]/g, (digit) =>
        String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
      )
      .replace(/\s/g, "")
      .replace(/-/g, "");

    if (!normalizedPhone) {
      newErrors.phone = "شماره تماس ولی را وارد کنید.";
    } else if (!/^09\d{9}$/.test(normalizedPhone)) {
      newErrors.phone =
        "شماره موبایل باید به شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد شود.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitted(false);

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    /*
     * فعلاً Prisma متصل نیست.
     * در مرحله بعد همین بخش به API / Server Action
     * و سپس Prisma متصل خواهد شد.
     */

    await new Promise((resolve) => setTimeout(resolve, 700));

    setIsSubmitting(false);
    setIsSubmitted(true);

    setFullName("");
    setGrade("");
    setGuardianName("");
    setPhone("");
    setDescription("");
    setErrors({});
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#194342]">
          <div className="absolute -right-[70px] -top-[70px] h-[240px] w-[240px] rounded-full border border-[#DBE7C1]/15" />

          <div className="absolute -right-[35px] -top-[35px] h-[155px] w-[155px] rounded-full border border-[#DBE7C1]/10" />

          <div className="absolute -bottom-[100px] -left-[100px] h-[280px] w-[280px] rounded-full border border-[#DBE7C1]/10" />

          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 py-12 text-center sm:px-6">
            <span className="inline-flex rounded-full border border-[#DBE7C1]/30 bg-[#DBE7C1]/[0.18] px-3.5 py-1 text-xs font-medium text-[#DBE7C1]">
              شاهد حضرت خدیجه (س)
            </span>

            <h1 className="mt-4 text-[clamp(26px,5vw,38px)] font-bold leading-[1.4] text-white">
              پیش‌ثبت‌نام مدرسه
            </h1>

            <p className="mx-auto mt-3 max-w-[560px] text-[13.5px] leading-[1.9] text-[#DBE7C1]/85 sm:text-[15px]">
              اطلاعات اولیه دانش‌آموز را وارد کنید تا درخواست پیش‌ثبت‌نام شما
              بررسی شود.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="mx-auto w-full max-w-[760px] px-5 py-10 sm:px-6 sm:py-14">
          {!isSubmitted ? (
            <>
              <Link
                href="/"
                className="mb-5 inline-flex items-center text-[12.5px] font-medium text-[#194342] transition-colors hover:text-[#B86F5B]"
              >
                ← بازگشت به صفحه اصلی
              </Link>

              <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-5 sm:p-8">
                <div>
                  <h2 className="text-[18px] font-bold text-[#194342]">
                    اطلاعات پیش‌ثبت‌نام
                  </h2>

                  <p className="mt-2 text-[12.5px] leading-6 text-[#667085]">
                    لطفاً اطلاعات زیر را با دقت وارد کنید.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-8 space-y-5"
                >
                  {/* Student Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                    >
                      نام و نام خانوادگی دانش‌آموز
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) => {
                        setFullName(event.target.value);

                        if (errors.fullName) {
                          setErrors((current) => ({
                            ...current,
                            fullName: undefined,
                          }));
                        }
                      }}
                      placeholder="نام و نام خانوادگی"
                      className={`h-11 w-full rounded-[10px] border bg-white px-4 text-[13px] text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] ${
                        errors.fullName
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DBE7C1] focus:border-[#194342]"
                      }`}
                    />

                    {errors.fullName && (
                      <p className="mt-1.5 text-[11.5px] text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Grade */}
                  <div>
                    <label
                      htmlFor="grade"
                      className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                    >
                      پایه موردنظر
                    </label>

                    <select
                      id="grade"
                      name="grade"
                      value={grade}
                      onChange={(event) => {
                        setGrade(event.target.value);

                        if (errors.grade) {
                          setErrors((current) => ({
                            ...current,
                            grade: undefined,
                          }));
                        }
                      }}
                      className={`h-11 w-full rounded-[10px] border bg-white px-4 text-[13px] outline-none transition-colors ${
                        errors.grade
                          ? "border-red-400 text-[#667085] focus:border-red-500"
                          : "border-[#DBE7C1] text-[#667085] focus:border-[#194342]"
                      }`}
                    >
                      <option value="" disabled>
                        پایه موردنظر را انتخاب کنید
                      </option>

                      <option value="10">پایه دهم</option>
                      <option value="11">پایه یازدهم</option>
                      <option value="12">پایه دوازدهم</option>
                    </select>

                    {errors.grade && (
                      <p className="mt-1.5 text-[11.5px] text-red-500">
                        {errors.grade}
                      </p>
                    )}
                  </div>

                  {/* Guardian Name */}
                  <div>
                    <label
                      htmlFor="guardianName"
                      className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                    >
                      نام و نام خانوادگی ولی
                    </label>

                    <input
                      id="guardianName"
                      name="guardianName"
                      type="text"
                      value={guardianName}
                      onChange={(event) => {
                        setGuardianName(event.target.value);

                        if (errors.guardianName) {
                          setErrors((current) => ({
                            ...current,
                            guardianName: undefined,
                          }));
                        }
                      }}
                      placeholder="نام و نام خانوادگی ولی"
                      className={`h-11 w-full rounded-[10px] border bg-white px-4 text-[13px] text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] ${
                        errors.guardianName
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DBE7C1] focus:border-[#194342]"
                      }`}
                    />

                    {errors.guardianName && (
                      <p className="mt-1.5 text-[11.5px] text-red-500">
                        {errors.guardianName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                    >
                      شماره تماس ولی
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);

                        if (errors.phone) {
                          setErrors((current) => ({
                            ...current,
                            phone: undefined,
                          }));
                        }
                      }}
                      placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                      dir="ltr"
                      className={`h-11 w-full rounded-[10px] border bg-white px-4 text-[13px] text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] ${
                        errors.phone
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#DBE7C1] focus:border-[#194342]"
                      }`}
                    />

                    {errors.phone && (
                      <p className="mt-1.5 text-[11.5px] text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                    >
                      توضیحات
                      <span className="mr-1 font-normal text-[#98A2B3]">
                        (اختیاری)
                      </span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="اگر درخواست یا توضیح خاصی دارید، اینجا بنویسید."
                      className="w-full resize-none rounded-[10px] border border-[#DBE7C1] bg-white px-4 py-3 text-[13px] leading-7 text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#194342]"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#B86F5B] text-[13px] font-medium text-white transition-colors hover:bg-[#A45F4D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "در حال ثبت درخواست..."
                      : "ثبت درخواست پیش‌ثبت‌نام"}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-6 sm:p-10">
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DBE7C1]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-[#194342]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>

                <h2 className="mt-5 text-[20px] font-bold text-[#194342]">
                  درخواست پیش‌ثبت‌نام ثبت شد
                </h2>

                <p className="mx-auto mt-3 max-w-[440px] text-[13px] leading-7 text-[#667085]">
                  اطلاعات شما با موفقیت دریافت شد و درخواست پیش‌ثبت‌نام برای
                  مدرسه ثبت شد.
                </p>

                <p className="mt-2 text-[12px] leading-6 text-[#98A2B3]">
                  پس از بررسی اطلاعات، مدرسه با شما تماس خواهد گرفت.
                </p>

                <div className="mt-7 flex justify-center">
                  <Link
                    href="/"
                    className="flex h-10 items-center justify-center rounded-[10px] bg-[#194342] px-6 text-[12.5px] font-medium text-white transition-colors hover:bg-[#143837]"
                  >
                    بازگشت به صفحه اصلی
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <CoursesFooter />
    </>
  );
}