"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import JalaliDatePicker from "@/components/ui/JalaliDatePicker";

import { isValidJalaliDate, normalizeDigits } from "@/lib/date/jalali";

type FormErrors = {
  studentFirstName?: string;
  studentLastName?: string;
  birthDate?: string;
  nationalId?: string;
  birthCertificateSerial?: string;
  grade?: string;
  studentPhone?: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  fatherNationalId?: string;
  fatherJob?: string;
  fatherEducation?: string;
  fatherPhone?: string;
  motherFirstName?: string;
  motherLastName?: string;
  motherNationalId?: string;
  motherJob?: string;
  motherEducation?: string;
  motherPhone?: string;
  address?: string;
  landlinePhone?: string;
  description?: string;
};

function normalizePhone(value: string) {
  return normalizeDigits(value).replace(/\s/g, "").replace(/-/g, "");
}

function normalizeNationalId(value: string) {
  return normalizeDigits(value).replace(/\s/g, "");
}

function isValidIranianNationalId(value: string) {
  const nationalId = normalizeNationalId(value);

  if (!/^\d{10}$/.test(nationalId)) {
    return false;
  }

  if (/^(\d)\1{9}$/.test(nationalId)) {
    return false;
  }

  const digits = nationalId.split("").map(Number);
  const checkDigit = digits[9];

  const weightedSum = digits
    .slice(0, 9)
    .reduce((sum, digit, index) => sum + digit * (10 - index), 0);

  const remainder = weightedSum % 11;

  const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === calculatedCheckDigit;
}

export default function RegistrationPage() {
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthCertificateSerial, setBirthCertificateSerial] = useState("");
  const [grade, setGrade] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  const [fatherFirstName, setFatherFirstName] = useState("");
  const [fatherLastName, setFatherLastName] = useState("");
  const [fatherNationalId, setFatherNationalId] = useState("");
  const [fatherJob, setFatherJob] = useState("");
  const [fatherEducation, setFatherEducation] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");

  const [motherFirstName, setMotherFirstName] = useState("");
  const [motherLastName, setMotherLastName] = useState("");
  const [motherNationalId, setMotherNationalId] = useState("");
  const [motherJob, setMotherJob] = useState("");
  const [motherEducation, setMotherEducation] = useState("");
  const [motherPhone, setMotherPhone] = useState("");

  const [address, setAddress] = useState("");
  const [landlinePhone, setLandlinePhone] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validateForm() {
    const nextErrors: FormErrors = {};

    const normalizedStudentPhone = normalizePhone(studentPhone);
    const normalizedNationalId = normalizeNationalId(nationalId);
    const normalizedFatherNationalId = normalizeNationalId(fatherNationalId);
    const normalizedMotherNationalId = normalizeNationalId(motherNationalId);
    const normalizedFatherPhone = normalizePhone(fatherPhone);
    const normalizedMotherPhone = normalizePhone(motherPhone);
    const normalizedLandlinePhone = normalizePhone(landlinePhone);

    if (!studentFirstName.trim()) {
      nextErrors.studentFirstName = "نام دانش‌آموز الزامی است.";
    }

    if (!studentLastName.trim()) {
      nextErrors.studentLastName = "نام خانوادگی دانش‌آموز الزامی است.";
    }

    if (!birthDate.trim()) {
      nextErrors.birthDate = "تاریخ تولد الزامی است.";
    } else if (!isValidJalaliDate(birthDate)) {
      nextErrors.birthDate = "تاریخ تولد معتبر نیست.";
    }

    if (!normalizedNationalId) {
      nextErrors.nationalId = "کد ملی دانش‌آموز الزامی است.";
    } else if (!isValidIranianNationalId(normalizedNationalId)) {
      nextErrors.nationalId = "کد ملی دانش‌آموز معتبر نیست.";
    }

    if (!birthCertificateSerial.trim()) {
      nextErrors.birthCertificateSerial = "سری شناسنامه الزامی است.";
    }

    if (!grade) {
      nextErrors.grade = "پایه تحصیلی را انتخاب کنید.";
    }

    if (!normalizedStudentPhone) {
      nextErrors.studentPhone = "شماره تلفن همراه دانش‌آموز الزامی است.";
    } else if (!/^09\d{9}$/.test(normalizedStudentPhone)) {
      nextErrors.studentPhone = "شماره تلفن همراه معتبر نیست.";
    }

    if (!fatherFirstName.trim()) {
      nextErrors.fatherFirstName = "نام پدر الزامی است.";
    }

    if (!fatherLastName.trim()) {
      nextErrors.fatherLastName = "نام خانوادگی پدر الزامی است.";
    }

    if (!normalizedFatherNationalId) {
      nextErrors.fatherNationalId = "کد ملی پدر الزامی است.";
    } else if (!isValidIranianNationalId(normalizedFatherNationalId)) {
      nextErrors.fatherNationalId = "کد ملی پدر معتبر نیست.";
    }

    if (!fatherJob.trim()) {
      nextErrors.fatherJob = "شغل پدر الزامی است.";
    }

    if (!fatherEducation.trim()) {
      nextErrors.fatherEducation = "تحصیلات پدر الزامی است.";
    }

    if (!normalizedFatherPhone) {
      nextErrors.fatherPhone = "شماره تلفن همراه پدر الزامی است.";
    } else if (!/^09\d{9}$/.test(normalizedFatherPhone)) {
      nextErrors.fatherPhone = "شماره تلفن همراه پدر معتبر نیست.";
    }

    if (!motherFirstName.trim()) {
      nextErrors.motherFirstName = "نام مادر الزامی است.";
    }

    if (!motherLastName.trim()) {
      nextErrors.motherLastName = "نام خانوادگی مادر الزامی است.";
    }

    if (!normalizedMotherNationalId) {
      nextErrors.motherNationalId = "کد ملی مادر الزامی است.";
    } else if (!isValidIranianNationalId(normalizedMotherNationalId)) {
      nextErrors.motherNationalId = "کد ملی مادر معتبر نیست.";
    }

    if (!motherJob.trim()) {
      nextErrors.motherJob = "شغل مادر الزامی است.";
    }

    if (!motherEducation.trim()) {
      nextErrors.motherEducation = "تحصیلات مادر الزامی است.";
    }

    if (!normalizedMotherPhone) {
      nextErrors.motherPhone = "شماره تلفن همراه مادر الزامی است.";
    } else if (!/^09\d{9}$/.test(normalizedMotherPhone)) {
      nextErrors.motherPhone = "شماره تلفن همراه مادر معتبر نیست.";
    }

    if (!address.trim()) {
      nextErrors.address = "آدرس الزامی است.";
    }

    if (
      normalizedLandlinePhone &&
      !/^0\d{9,10}$/.test(normalizedLandlinePhone)
    ) {
      nextErrors.landlinePhone = "شماره تلفن ثابت معتبر نیست.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitted(false);
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admission-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentFirstName: studentFirstName.trim(),
          studentLastName: studentLastName.trim(),

          birthDate: normalizeDigits(birthDate).trim(),

          nationalId: normalizeNationalId(nationalId),

          birthCertificateSerial: normalizeDigits(
            birthCertificateSerial,
          ).trim(),

          requestedGrade: grade,

          studentMobile: normalizePhone(studentPhone),

          fatherFirstName: fatherFirstName.trim(),
          fatherLastName: fatherLastName.trim(),
          fatherNationalId: normalizeNationalId(fatherNationalId),
          fatherJob: fatherJob.trim(),
          fatherEducation: fatherEducation.trim(),
          fatherMobile: normalizePhone(fatherPhone),

          motherFirstName: motherFirstName.trim(),
          motherLastName: motherLastName.trim(),
          motherNationalId: normalizeNationalId(motherNationalId),
          motherJob: motherJob.trim(),
          motherEducation: motherEducation.trim(),
          motherMobile: normalizePhone(motherPhone),

          address: address.trim(),
          landline: normalizePhone(landlinePhone),
          description: description.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "این کد ملی قبلاً در سیستم مدرسه ثبت شده است.") {
          setErrors((previous) => ({
            ...previous,
            nationalId: result.error,
          }));
        } else {
          setSubmitError(result.error || "ثبت درخواست ثبت‌نام انجام نشد.");
        }

        if (result.details) {
          console.error("Admission validation errors:", result.details);
        }

        return;
      }

      setIsSubmitted(true);
      setErrors({});
      setSubmitError("");

      setStudentFirstName("");
      setStudentLastName("");
      setBirthDate("");
      setNationalId("");
      setBirthCertificateSerial("");
      setGrade("");
      setStudentPhone("");

      setFatherFirstName("");
      setFatherLastName("");
      setFatherNationalId("");
      setFatherJob("");
      setFatherEducation("");
      setFatherPhone("");

      setMotherFirstName("");
      setMotherLastName("");
      setMotherNationalId("");
      setMotherJob("");
      setMotherEducation("");
      setMotherPhone("");

      setAddress("");
      setLandlinePhone("");
      setDescription("");
    } catch (error) {
      console.error("Registration submission error:", error);

      setSubmitError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10">
            <Link
              href="/"
              className="mb-4 inline-flex text-sm text-[#194342]/70 transition hover:text-[#194342]"
            >
              بازگشت به صفحه اصلی
            </Link>

            <h1 className="text-3xl font-bold text-[#194342] sm:text-4xl">
              پیش‌ثبت‌نام مدرسه
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#194342]/70 sm:text-base">
              اطلاعات مورد نیاز را با دقت وارد کنید. پس از بررسی اطلاعات، نتیجه
              درخواست توسط مدرسه اعلام خواهد شد.
            </p>
          </div>

          {isSubmitted && (
            <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm leading-7 text-green-800">
              درخواست ثبت‌نام شما با موفقیت ثبت شد. اطلاعات شما پس از بررسی توسط
              مدرسه پیگیری خواهد شد.
            </div>
          )}

          {submitError && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* اطلاعات دانش‌آموز */}

            <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#194342]">
                  اطلاعات دانش‌آموز
                </h2>

                <p className="mt-2 text-sm text-[#194342]/60">
                  اطلاعات هویتی و تحصیلی دانش‌آموز
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    نام
                  </label>

                  <input
                    type="text"
                    value={studentFirstName}
                    onChange={(event) =>
                      setStudentFirstName(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                    placeholder="مثلاً سارا"
                  />

                  {errors.studentFirstName && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.studentFirstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    نام خانوادگی
                  </label>

                  <input
                    type="text"
                    value={studentLastName}
                    onChange={(event) => setStudentLastName(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                    placeholder="مثلاً احمدی"
                  />

                  {errors.studentLastName && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.studentLastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    تاریخ تولد
                  </label>

                  <JalaliDatePicker
                    value={birthDate}
                    onChange={setBirthDate}
                    placeholder="تاریخ تولد"
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.birthDate && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.birthDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    کد ملی
                  </label>

                  <input
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    value={nationalId}
                    onChange={(event) => setNationalId(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                    placeholder="۱۰ رقم"
                  />

                  {errors.nationalId && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.nationalId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    سری شناسنامه
                  </label>

                  <input
                    type="text"
                    value={birthCertificateSerial}
                    onChange={(event) =>
                      setBirthCertificateSerial(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                    placeholder="سری شناسنامه"
                  />

                  {errors.birthCertificateSerial && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.birthCertificateSerial}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    پایه مورد درخواست
                  </label>

                  <select
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  >
                    <option value="">انتخاب پایه</option>
                    <option value="10">پایه دهم</option>
                    <option value="11">پایه یازدهم</option>
                    <option value="12">پایه دوازدهم</option>
                  </select>

                  {errors.grade && (
                    <p className="mt-2 text-xs text-red-600">{errors.grade}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    شماره تلفن همراه
                  </label>

                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    value={studentPhone}
                    onChange={(event) => setStudentPhone(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                    placeholder="09123456789"
                  />

                  {errors.studentPhone && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.studentPhone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* اطلاعات پدر */}

            <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#194342]">
                  اطلاعات پدر
                </h2>

                <p className="mt-2 text-sm text-[#194342]/60">
                  اطلاعات تماس و مشخصات پدر
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    نام
                  </label>

                  <input
                    type="text"
                    value={fatherFirstName}
                    onChange={(event) => setFatherFirstName(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.fatherFirstName && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.fatherFirstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    نام خانوادگی
                  </label>

                  <input
                    type="text"
                    value={fatherLastName}
                    onChange={(event) => setFatherLastName(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.fatherLastName && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.fatherLastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    کد ملی پدر
                  </label>

                  <input
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    value={fatherNationalId}
                    onChange={(event) =>
                      setFatherNationalId(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.fatherNationalId && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.fatherNationalId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    شغل پدر
                  </label>

                  <input
                    type="text"
                    value={fatherJob}
                    onChange={(event) => setFatherJob(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.fatherJob && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.fatherJob}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    تحصیلات پدر
                  </label>

                  <input
                    type="text"
                    value={fatherEducation}
                    onChange={(event) => setFatherEducation(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.fatherEducation && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.fatherEducation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    شماره تلفن همراه پدر
                  </label>

                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    value={fatherPhone}
                    onChange={(event) => setFatherPhone(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                    placeholder="09123456789"
                  />

                  {errors.fatherPhone && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.fatherPhone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* اطلاعات مادر */}

            <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#194342]">
                  اطلاعات مادر
                </h2>

                <p className="mt-2 text-sm text-[#194342]/60">
                  اطلاعات تماس و مشخصات مادر
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    نام
                  </label>

                  <input
                    type="text"
                    value={motherFirstName}
                    onChange={(event) => setMotherFirstName(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.motherFirstName && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.motherFirstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    نام خانوادگی
                  </label>

                  <input
                    type="text"
                    value={motherLastName}
                    onChange={(event) => setMotherLastName(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.motherLastName && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.motherLastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    کد ملی مادر
                  </label>

                  <input
                    type="text"
                    dir="ltr"
                    inputMode="numeric"
                    value={motherNationalId}
                    onChange={(event) =>
                      setMotherNationalId(event.target.value)
                    }
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.motherNationalId && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.motherNationalId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    شغل مادر
                  </label>

                  <input
                    type="text"
                    value={motherJob}
                    onChange={(event) => setMotherJob(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.motherJob && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.motherJob}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    تحصیلات مادر
                  </label>

                  <input
                    type="text"
                    value={motherEducation}
                    onChange={(event) => setMotherEducation(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                  />

                  {errors.motherEducation && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.motherEducation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    شماره تلفن همراه مادر
                  </label>

                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    value={motherPhone}
                    onChange={(event) => setMotherPhone(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 bg-white px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                    placeholder="09123456789"
                  />

                  {errors.motherPhone && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.motherPhone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* اطلاعات تماس و آدرس */}

            <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#194342]">
                  اطلاعات تماس و آدرس
                </h2>

                <p className="mt-2 text-sm text-[#194342]/60">
                  اطلاعات محل سکونت و راه‌های ارتباطی
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    آدرس
                  </label>

                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                    placeholder="آدرس کامل محل سکونت"
                  />

                  {errors.address && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    تلفن ثابت
                  </label>

                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="tel"
                    value={landlinePhone}
                    onChange={(event) => setLandlinePhone(event.target.value)}
                    className="w-full rounded-xl border border-[#194342]/15 px-4 py-3 text-left text-sm outline-none transition focus:border-[#194342]"
                    placeholder="02112345678"
                  />

                  {errors.landlinePhone && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.landlinePhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#194342]">
                    توضیحات
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-[#194342]/15 px-4 py-3 text-sm outline-none transition focus:border-[#194342]"
                    placeholder="در صورت نیاز توضیحات تکمیلی خود را وارد کنید."
                  />
                </div>
              </div>
            </section>

            {/* دکمه ارسال */}

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#194342] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#143736] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
              >
                {isSubmitting ? "در حال ارسال..." : "ثبت درخواست ثبت‌نام"}
              </button>

              <p className="text-center text-xs leading-6 text-[#194342]/50">
                با ثبت این فرم، اطلاعات شما برای بررسی درخواست پیش‌ثبت‌نام در
                اختیار مدرسه قرار می‌گیرد.
              </p>
            </div>
          </form>
        </section>
      </main>

      <CoursesFooter />
    </>
  );
}
