"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";

type FormErrors = {
  studentName?: string;
  birthDate?: string;
  nationalId?: string;
  birthCertificateSerial?: string;
  grade?: string;
  studentPhone?: string;

  fatherName?: string;
  fatherNationalId?: string;
  fatherJob?: string;
  fatherEducation?: string;
  fatherPhone?: string;

  motherName?: string;
  motherNationalId?: string;
  motherJob?: string;
  motherEducation?: string;
  motherPhone?: string;

  address?: string;
  landlinePhone?: string;
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

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

  const calculatedCheckDigit =
    remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === calculatedCheckDigit;
}

function isValidJalaliDate(value: string) {
  const normalized = normalizeDigits(value).trim();

  const match = normalized.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1300 || year > 1500) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  const maxDay = month <= 6 ? 31 : month <= 11 ? 30 : 30;

  if (day < 1 || day > maxDay) {
    return false;
  }

  return true;
}

export default function RegistrationPage() {
  // Student
  const [studentName, setStudentName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthCertificateSerial, setBirthCertificateSerial] = useState("");
  const [grade, setGrade] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  // Father
  const [fatherName, setFatherName] = useState("");
  const [fatherNationalId, setFatherNationalId] = useState("");
  const [fatherJob, setFatherJob] = useState("");
  const [fatherEducation, setFatherEducation] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");

  // Mother
  const [motherName, setMotherName] = useState("");
  const [motherNationalId, setMotherNationalId] = useState("");
  const [motherJob, setMotherJob] = useState("");
  const [motherEducation, setMotherEducation] = useState("");
  const [motherPhone, setMotherPhone] = useState("");

  // Contact
  const [address, setAddress] = useState("");
  const [landlinePhone, setLandlinePhone] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const newErrors: FormErrors = {};

    // -----------------------------
    // Student
    // -----------------------------

    if (!studentName.trim()) {
      newErrors.studentName = "نام و نام خانوادگی دانش‌آموز را وارد کنید.";
    } else if (studentName.trim().length < 3) {
      newErrors.studentName = "نام واردشده معتبر نیست.";
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = "تاریخ تولد را وارد کنید.";
    } else if (!isValidJalaliDate(birthDate)) {
      newErrors.birthDate =
        "تاریخ تولد را به شکل ۱۴۰۰/۰۱/۰۱ وارد کنید.";
    }

    const normalizedNationalId = normalizeNationalId(nationalId);

    if (!normalizedNationalId) {
      newErrors.nationalId = "کد ملی دانش‌آموز را وارد کنید.";
    } else if (!isValidIranianNationalId(normalizedNationalId)) {
      newErrors.nationalId = "کد ملی واردشده معتبر نیست.";
    }

    if (!birthCertificateSerial.trim()) {
      newErrors.birthCertificateSerial = "سریال شناسنامه را وارد کنید.";
    }

    if (!grade) {
      newErrors.grade = "پایه موردنظر را انتخاب کنید.";
    }

    const normalizedStudentPhone = normalizePhone(studentPhone);

    if (!normalizedStudentPhone) {
      newErrors.studentPhone = "شماره تلفن همراه دانش‌آموز را وارد کنید.";
    } else if (!/^09\d{9}$/.test(normalizedStudentPhone)) {
      newErrors.studentPhone =
        "شماره تلفن همراه باید به شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد شود.";
    }

    // -----------------------------
    // Father
    // -----------------------------

    if (!fatherName.trim()) {
      newErrors.fatherName = "نام و نام خانوادگی پدر را وارد کنید.";
    } else if (fatherName.trim().length < 3) {
      newErrors.fatherName = "نام واردشده معتبر نیست.";
    }

    const normalizedFatherNationalId = normalizeNationalId(fatherNationalId);

    if (!normalizedFatherNationalId) {
      newErrors.fatherNationalId = "کد ملی پدر را وارد کنید.";
    } else if (!isValidIranianNationalId(normalizedFatherNationalId)) {
      newErrors.fatherNationalId = "کد ملی واردشده معتبر نیست.";
    }

    if (!fatherJob.trim()) {
      newErrors.fatherJob = "شغل پدر را وارد کنید.";
    }

    if (!fatherEducation.trim()) {
      newErrors.fatherEducation = "تحصیلات پدر را وارد کنید.";
    }

    const normalizedFatherPhone = normalizePhone(fatherPhone);

    if (!normalizedFatherPhone) {
      newErrors.fatherPhone = "شماره تلفن همراه پدر را وارد کنید.";
    } else if (!/^09\d{9}$/.test(normalizedFatherPhone)) {
      newErrors.fatherPhone =
        "شماره تلفن همراه باید به شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد شود.";
    }

    // -----------------------------
    // Mother
    // -----------------------------

    if (!motherName.trim()) {
      newErrors.motherName = "نام و نام خانوادگی مادر را وارد کنید.";
    } else if (motherName.trim().length < 3) {
      newErrors.motherName = "نام واردشده معتبر نیست.";
    }

    const normalizedMotherNationalId = normalizeNationalId(motherNationalId);

    if (!normalizedMotherNationalId) {
      newErrors.motherNationalId = "کد ملی مادر را وارد کنید.";
    } else if (!isValidIranianNationalId(normalizedMotherNationalId)) {
      newErrors.motherNationalId = "کد ملی واردشده معتبر نیست.";
    }

    if (!motherJob.trim()) {
      newErrors.motherJob = "شغل مادر را وارد کنید.";
    }

    if (!motherEducation.trim()) {
      newErrors.motherEducation = "تحصیلات مادر را وارد کنید.";
    }

    const normalizedMotherPhone = normalizePhone(motherPhone);

    if (!normalizedMotherPhone) {
      newErrors.motherPhone = "شماره تلفن همراه مادر را وارد کنید.";
    } else if (!/^09\d{9}$/.test(normalizedMotherPhone)) {
      newErrors.motherPhone =
        "شماره تلفن همراه باید به شکل ۰۹۱۲۱۲۳۴۵۶۷ وارد شود.";
    }

    // -----------------------------
    // Contact
    // -----------------------------

    if (!address.trim()) {
      newErrors.address = "آدرس کامل را وارد کنید.";
    }

    if (landlinePhone.trim()) {
      const normalizedLandlinePhone = normalizePhone(landlinePhone);

      if (!/^0\d{9,10}$/.test(normalizedLandlinePhone)) {
        newErrors.landlinePhone = "شماره تلفن ثابت واردشده معتبر نیست.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
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
     * در مرحله بعد همین بخش به Server Action
     * و سپس Prisma متصل خواهد شد.
     */

    await new Promise((resolve) => setTimeout(resolve, 700));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Student
    setStudentName("");
    setBirthDate("");
    setNationalId("");
    setBirthCertificateSerial("");
    setGrade("");
    setStudentPhone("");

    // Father
    setFatherName("");
    setFatherNationalId("");
    setFatherJob("");
    setFatherEducation("");
    setFatherPhone("");

    // Mother
    setMotherName("");
    setMotherNationalId("");
    setMotherJob("");
    setMotherEducation("");
    setMotherPhone("");

    // Contact
    setAddress("");
    setLandlinePhone("");
    setDescription("");

    setErrors({});
  }

  const inputClass = (error?: string) =>
    `h-11 w-full rounded-[10px] border bg-white px-4 text-[13px] text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] ${
      error
        ? "border-red-400 focus:border-red-500"
        : "border-[#DBE7C1] focus:border-[#194342]"
    }`;

  const selectClass = (error?: string) =>
    `h-11 w-full rounded-[10px] border bg-white px-4 text-[13px] outline-none transition-colors ${
      error
        ? "border-red-400 text-[#667085] focus:border-red-500"
        : "border-[#DBE7C1] text-[#667085] focus:border-[#194342]"
    }`;

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
                  className="mt-8 space-y-8"
                >
                  {/* Student Information */}
                  <section>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full bg-[#B86F5B]" />

                      <div>
                        <h3 className="text-[15px] font-bold text-[#194342]">
                          اطلاعات دانش‌آموز
                        </h3>

                        <p className="mt-1 text-[11.5px] text-[#98A2B3]">
                          اطلاعات شناسایی و تحصیلی دانش‌آموز
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="studentName"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          نام و نام خانوادگی دانش‌آموز
                        </label>

                        <input
                          id="studentName"
                          name="studentName"
                          type="text"
                          value={studentName}
                          onChange={(event) => {
                            setStudentName(event.target.value);
                            clearError("studentName");
                          }}
                          placeholder="نام و نام خانوادگی"
                          className={inputClass(errors.studentName)}
                        />

                        {errors.studentName && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.studentName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="birthDate"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          تاریخ تولد
                        </label>

                        <input
                          id="birthDate"
                          name="birthDate"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={birthDate}
                          onChange={(event) => {
                            setBirthDate(event.target.value);
                            clearError("birthDate");
                          }}
                          placeholder="۱۴۰۰/۰۱/۰۱"
                          dir="ltr"
                          className={inputClass(errors.birthDate)}
                        />

                        {errors.birthDate && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.birthDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="nationalId"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          کد ملی
                        </label>

                        <input
                          id="nationalId"
                          name="nationalId"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={nationalId}
                          onChange={(event) => {
                            setNationalId(event.target.value);
                            clearError("nationalId");
                          }}
                          placeholder="کد ملی ۱۰ رقمی"
                          dir="ltr"
                          className={inputClass(errors.nationalId)}
                        />

                        {errors.nationalId && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.nationalId}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="birthCertificateSerial"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          سریال شناسنامه
                        </label>

                        <input
                          id="birthCertificateSerial"
                          name="birthCertificateSerial"
                          type="text"
                          value={birthCertificateSerial}
                          onChange={(event) => {
                            setBirthCertificateSerial(event.target.value);
                            clearError("birthCertificateSerial");
                          }}
                          placeholder="سریال شناسنامه"
                          className={inputClass(errors.birthCertificateSerial)}
                        />

                        {errors.birthCertificateSerial && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.birthCertificateSerial}
                          </p>
                        )}
                      </div>

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
                            clearError("grade");
                          }}
                          className={selectClass(errors.grade)}
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

                      <div>
                        <label
                          htmlFor="studentPhone"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          شماره تلفن همراه دانش‌آموز
                        </label>

                        <input
                          id="studentPhone"
                          name="studentPhone"
                          type="tel"
                          inputMode="tel"
                          value={studentPhone}
                          onChange={(event) => {
                            setStudentPhone(event.target.value);
                            clearError("studentPhone");
                          }}
                          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                          dir="ltr"
                          className={inputClass(errors.studentPhone)}
                        />

                        {errors.studentPhone && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.studentPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-[#DBE7C1]" />

                  {/* Father Information */}
                  <section>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full bg-[#B86F5B]" />

                      <div>
                        <h3 className="text-[15px] font-bold text-[#194342]">
                          اطلاعات پدر
                        </h3>

                        <p className="mt-1 text-[11.5px] text-[#98A2B3]">
                          اطلاعات هویتی و تماس پدر
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="fatherName"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          نام و نام خانوادگی پدر
                        </label>

                        <input
                          id="fatherName"
                          name="fatherName"
                          type="text"
                          value={fatherName}
                          onChange={(event) => {
                            setFatherName(event.target.value);
                            clearError("fatherName");
                          }}
                          placeholder="نام و نام خانوادگی"
                          className={inputClass(errors.fatherName)}
                        />

                        {errors.fatherName && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.fatherName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="fatherNationalId"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          کد ملی پدر
                        </label>

                        <input
                          id="fatherNationalId"
                          name="fatherNationalId"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={fatherNationalId}
                          onChange={(event) => {
                            setFatherNationalId(event.target.value);
                            clearError("fatherNationalId");
                          }}
                          placeholder="کد ملی ۱۰ رقمی"
                          dir="ltr"
                          className={inputClass(errors.fatherNationalId)}
                        />

                        {errors.fatherNationalId && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.fatherNationalId}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="fatherJob"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          شغل
                        </label>

                        <input
                          id="fatherJob"
                          name="fatherJob"
                          type="text"
                          value={fatherJob}
                          onChange={(event) => {
                            setFatherJob(event.target.value);
                            clearError("fatherJob");
                          }}
                          placeholder="شغل پدر"
                          className={inputClass(errors.fatherJob)}
                        />

                        {errors.fatherJob && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.fatherJob}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="fatherEducation"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          تحصیلات
                        </label>

                        <input
                          id="fatherEducation"
                          name="fatherEducation"
                          type="text"
                          value={fatherEducation}
                          onChange={(event) => {
                            setFatherEducation(event.target.value);
                            clearError("fatherEducation");
                          }}
                          placeholder="مثلاً کارشناسی"
                          className={inputClass(errors.fatherEducation)}
                        />

                        {errors.fatherEducation && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.fatherEducation}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="fatherPhone"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          شماره تلفن همراه پدر
                        </label>

                        <input
                          id="fatherPhone"
                          name="fatherPhone"
                          type="tel"
                          inputMode="tel"
                          value={fatherPhone}
                          onChange={(event) => {
                            setFatherPhone(event.target.value);
                            clearError("fatherPhone");
                          }}
                          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                          dir="ltr"
                          className={inputClass(errors.fatherPhone)}
                        />

                        {errors.fatherPhone && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.fatherPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-[#DBE7C1]" />

                  {/* Mother Information */}
                  <section>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full bg-[#B86F5B]" />

                      <div>
                        <h3 className="text-[15px] font-bold text-[#194342]">
                          اطلاعات مادر
                        </h3>

                        <p className="mt-1 text-[11.5px] text-[#98A2B3]">
                          اطلاعات هویتی و تماس مادر
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="motherName"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          نام و نام خانوادگی مادر
                        </label>

                        <input
                          id="motherName"
                          name="motherName"
                          type="text"
                          value={motherName}
                          onChange={(event) => {
                            setMotherName(event.target.value);
                            clearError("motherName");
                          }}
                          placeholder="نام و نام خانوادگی"
                          className={inputClass(errors.motherName)}
                        />

                        {errors.motherName && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.motherName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="motherNationalId"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          کد ملی مادر
                        </label>

                        <input
                          id="motherNationalId"
                          name="motherNationalId"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={motherNationalId}
                          onChange={(event) => {
                            setMotherNationalId(event.target.value);
                            clearError("motherNationalId");
                          }}
                          placeholder="کد ملی ۱۰ رقمی"
                          dir="ltr"
                          className={inputClass(errors.motherNationalId)}
                        />

                        {errors.motherNationalId && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.motherNationalId}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="motherJob"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          شغل
                        </label>

                        <input
                          id="motherJob"
                          name="motherJob"
                          type="text"
                          value={motherJob}
                          onChange={(event) => {
                            setMotherJob(event.target.value);
                            clearError("motherJob");
                          }}
                          placeholder="شغل مادر"
                          className={inputClass(errors.motherJob)}
                        />

                        {errors.motherJob && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.motherJob}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="motherEducation"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          تحصیلات
                        </label>

                        <input
                          id="motherEducation"
                          name="motherEducation"
                          type="text"
                          value={motherEducation}
                          onChange={(event) => {
                            setMotherEducation(event.target.value);
                            clearError("motherEducation");
                          }}
                          placeholder="مثلاً کارشناسی"
                          className={inputClass(errors.motherEducation)}
                        />

                        {errors.motherEducation && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.motherEducation}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="motherPhone"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          شماره تلفن همراه مادر
                        </label>

                        <input
                          id="motherPhone"
                          name="motherPhone"
                          type="tel"
                          inputMode="tel"
                          value={motherPhone}
                          onChange={(event) => {
                            setMotherPhone(event.target.value);
                            clearError("motherPhone");
                          }}
                          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                          dir="ltr"
                          className={inputClass(errors.motherPhone)}
                        />

                        {errors.motherPhone && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.motherPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-[#DBE7C1]" />

                  {/* Contact Information */}
                  <section>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="h-8 w-1 rounded-full bg-[#B86F5B]" />

                      <div>
                        <h3 className="text-[15px] font-bold text-[#194342]">
                          اطلاعات تماس
                        </h3>

                        <p className="mt-1 text-[11.5px] text-[#98A2B3]">
                          اطلاعات محل سکونت و توضیحات تکمیلی
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="address"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          آدرس کامل
                        </label>

                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={address}
                          onChange={(event) => {
                            setAddress(event.target.value);
                            clearError("address");
                          }}
                          placeholder="آدرس کامل محل سکونت"
                          className={`w-full resize-none rounded-[10px] border bg-white px-4 py-3 text-[13px] leading-7 text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] ${
                            errors.address
                              ? "border-red-400 focus:border-red-500"
                              : "border-[#DBE7C1] focus:border-[#194342]"
                          }`}
                        />

                        {errors.address && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.address}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="landlinePhone"
                          className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                        >
                          شماره تلفن ثابت
                          <span className="mr-1 font-normal text-[#98A2B3]">
                            (اختیاری)
                          </span>
                        </label>

                        <input
                          id="landlinePhone"
                          name="landlinePhone"
                          type="tel"
                          inputMode="tel"
                          value={landlinePhone}
                          onChange={(event) => {
                            setLandlinePhone(event.target.value);
                            clearError("landlinePhone");
                          }}
                          placeholder="۰۲۱۱۲۳۴۵۶۷۸"
                          dir="ltr"
                          className={inputClass(errors.landlinePhone)}
                        />

                        {errors.landlinePhone && (
                          <p className="mt-1.5 text-[11.5px] text-red-500">
                            {errors.landlinePhone}
                          </p>
                        )}
                      </div>

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
                          rows={3}
                          value={description}
                          onChange={(event) =>
                            setDescription(event.target.value)
                          }
                          placeholder="اگر درخواست یا توضیح خاصی دارید، اینجا بنویسید."
                          className="w-full resize-none rounded-[10px] border border-[#DBE7C1] bg-white px-4 py-3 text-[13px] leading-7 text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#194342]"
                        />
                      </div>
                    </div>
                  </section>

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