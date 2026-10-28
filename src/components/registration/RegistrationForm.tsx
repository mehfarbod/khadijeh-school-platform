"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import JalaliDatePicker from "@/components/ui/JalaliDatePicker";
import WitnessPointsTable from "@/components/registration/WitnessPointsTable";
import { isValidJalaliDate, normalizeDigits } from "@/lib/date/jalali";

const DRAFT_KEY = "khadijeh-admission-registration-draft-v2";

type FormErrors = Record<string, string | undefined>;

type Draft = {
  step: 1 | 2;
  form: {
    studentFirstName: string;
    studentLastName: string;
    birthDate: string;
    nationalId: string;
    birthCertificateSerial: string;
    grade: string;
    studentPhone: string;
    fatherFirstName: string;
    fatherLastName: string;
    fatherNationalId: string;
    fatherJob: string;
    fatherEducation: string;
    fatherPhone: string;
    motherFirstName: string;
    motherLastName: string;
    motherNationalId: string;
    motherJob: string;
    motherEducation: string;
    motherPhone: string;
    address: string;
    landlinePhone: string;
    description: string;
  };
  witnessPoints: Record<string, number>;
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "decimal";
};

function Field({ label, value, onChange, error, required = false, type = "text", placeholder, inputMode }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#194342]">
        {label}{required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`w-full rounded-xl border bg-[#FAF8F3] px-4 py-3 text-sm outline-none transition focus:border-[#194342] focus:ring-2 focus:ring-[#194342]/10 ${error ? "border-red-400" : "border-[#194342]/15"}`}
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function normalizePhone(value: string) {
  return normalizeDigits(value).replace(/\s/g, "").replace(/-/g, "");
}

function normalizeNationalId(value: string) {
  return normalizeDigits(value).replace(/\s/g, "");
}

function isValidIranianNationalId(value: string) {
  const nationalId = normalizeNationalId(value);
  if (!/^\d{10}$/.test(nationalId) || /^(\d)\1{9}$/.test(nationalId)) return false;
  const digits = nationalId.split("").map(Number);
  const weightedSum = digits.slice(0, 9).reduce((sum, digit, index) => sum + digit * (10 - index), 0);
  const remainder = weightedSum % 11;
  const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder;
  return digits[9] === calculatedCheckDigit;
}

const emptyForm: Draft["form"] = {
  studentFirstName: "",
  studentLastName: "",
  birthDate: "",
  nationalId: "",
  birthCertificateSerial: "",
  grade: "",
  studentPhone: "",
  fatherFirstName: "",
  fatherLastName: "",
  fatherNationalId: "",
  fatherJob: "",
  fatherEducation: "",
  fatherPhone: "",
  motherFirstName: "",
  motherLastName: "",
  motherNationalId: "",
  motherJob: "",
  motherEducation: "",
  motherPhone: "",
  address: "",
  landlinePhone: "",
  description: "",
};

export default function RegistrationForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Draft["form"]>(emptyForm);
  const [witnessPoints, setWitnessPoints] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as Partial<Draft>;
        setStep(draft.step === 2 ? 2 : 1);
        setForm({ ...emptyForm, ...(draft.form ?? {}) });
        setWitnessPoints(draft.witnessPoints ?? {});
      }
    } catch (error) {
      console.error("Failed to restore admission draft:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || isSubmitted) return;
    const draft: Draft = { step, form, witnessPoints };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [form, isLoaded, isSubmitted, step, witnessPoints]);

  const totalScore = useMemo(
    () => Object.values(witnessPoints).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0),
    [witnessPoints],
  );

  function updateForm<K extends keyof Draft["form"]>(key: K, value: Draft["form"][K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setSubmitError("");
  }

  function validateFirstStep() {
    const next: FormErrors = {};
    const studentPhone = normalizePhone(form.studentPhone);
    const nationalId = normalizeNationalId(form.nationalId);
    const fatherNationalId = normalizeNationalId(form.fatherNationalId);
    const motherNationalId = normalizeNationalId(form.motherNationalId);
    const fatherPhone = normalizePhone(form.fatherPhone);
    const motherPhone = normalizePhone(form.motherPhone);
    const landline = normalizePhone(form.landlinePhone);

    if (!form.studentFirstName.trim()) next.studentFirstName = "نام دانش‌آموز الزامی است.";
    if (!form.studentLastName.trim()) next.studentLastName = "نام خانوادگی دانش‌آموز الزامی است.";
    if (!form.birthDate.trim()) next.birthDate = "تاریخ تولد الزامی است.";
    else if (!isValidJalaliDate(form.birthDate)) next.birthDate = "تاریخ تولد معتبر نیست.";
    if (!nationalId) next.nationalId = "کد ملی دانش‌آموز الزامی است.";
    else if (!isValidIranianNationalId(nationalId)) next.nationalId = "کد ملی دانش‌آموز معتبر نیست.";
    if (!form.birthCertificateSerial.trim()) next.birthCertificateSerial = "سری شناسنامه الزامی است.";
    if (!form.grade) next.grade = "پایه تحصیلی را انتخاب کنید.";
    if (!/^09\d{9}$/.test(studentPhone)) next.studentPhone = "شماره تلفن همراه دانش‌آموز معتبر نیست.";

    if (!form.fatherFirstName.trim()) next.fatherFirstName = "نام پدر الزامی است.";
    if (!form.fatherLastName.trim()) next.fatherLastName = "نام خانوادگی پدر الزامی است.";
    if (!fatherNationalId || !isValidIranianNationalId(fatherNationalId)) next.fatherNationalId = "کد ملی پدر معتبر نیست.";
    if (!form.fatherJob.trim()) next.fatherJob = "شغل پدر الزامی است.";
    if (!form.fatherEducation.trim()) next.fatherEducation = "تحصیلات پدر الزامی است.";
    if (!/^09\d{9}$/.test(fatherPhone)) next.fatherPhone = "شماره تلفن همراه پدر معتبر نیست.";

    if (!form.motherFirstName.trim()) next.motherFirstName = "نام مادر الزامی است.";
    if (!form.motherLastName.trim()) next.motherLastName = "نام خانوادگی مادر الزامی است.";
    if (!motherNationalId || !isValidIranianNationalId(motherNationalId)) next.motherNationalId = "کد ملی مادر معتبر نیست.";
    if (!form.motherJob.trim()) next.motherJob = "شغل مادر الزامی است.";
    if (!form.motherEducation.trim()) next.motherEducation = "تحصیلات مادر الزامی است.";
    if (!/^09\d{9}$/.test(motherPhone)) next.motherPhone = "شماره تلفن همراه مادر معتبر نیست.";

    if (!form.address.trim()) next.address = "آدرس الزامی است.";
    if (landline && !/^0\d{9,10}$/.test(landline)) next.landlinePhone = "شماره تلفن ثابت معتبر نیست.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleFirstStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateFirstStep()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateWitnessPoint(id: number, value: number) {
    setWitnessPoints((previous) => {
      const next = { ...previous };
      if (!Number.isFinite(value) || value <= 0) delete next[String(id)];
      else next[String(id)] = value;
      return next;
    });
  }

  async function handleFinalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admission-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFirstName: form.studentFirstName.trim(),
          studentLastName: form.studentLastName.trim(),
          birthDate: normalizeDigits(form.birthDate).trim(),
          nationalId: normalizeNationalId(form.nationalId),
          birthCertificateSerial: normalizeDigits(form.birthCertificateSerial).trim(),
          requestedGrade: form.grade,
          studentMobile: normalizePhone(form.studentPhone),
          fatherFirstName: form.fatherFirstName.trim(),
          fatherLastName: form.fatherLastName.trim(),
          fatherNationalId: normalizeNationalId(form.fatherNationalId),
          fatherJob: form.fatherJob.trim(),
          fatherEducation: form.fatherEducation.trim(),
          fatherMobile: normalizePhone(form.fatherPhone),
          motherFirstName: form.motherFirstName.trim(),
          motherLastName: form.motherLastName.trim(),
          motherNationalId: normalizeNationalId(form.motherNationalId),
          motherJob: form.motherJob.trim(),
          motherEducation: form.motherEducation.trim(),
          motherMobile: normalizePhone(form.motherPhone),
          address: form.address.trim(),
          landline: normalizePhone(form.landlinePhone),
          description: form.description.trim() || null,
          witnessPoints,
          witnessTotalScore: totalScore,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.error === "این کد ملی قبلاً در سیستم مدرسه ثبت شده است.") {
          setErrors((previous) => ({ ...previous, nationalId: result.error }));
          setStep(1);
        } else {
          setSubmitError(result.error || "ثبت نهایی پیش‌ثبت‌نام انجام نشد.");
        }
        return;
      }

      window.localStorage.removeItem(DRAFT_KEY);
      setIsSubmitted(true);
      setErrors({});
      setSubmitError("");
    } catch (error) {
      console.error("Registration submission error:", error);
      setSubmitError("ارتباط با سرور برقرار نشد. اطلاعات شما در همین مرورگر حفظ شده است؛ دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-[#194342]/60">در حال بازیابی اطلاعات ثبت‌نام…</div>;
  }

  if (isSubmitted) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
          <h2 className="text-2xl font-bold text-green-900">پیش‌ثبت‌نام با موفقیت تکمیل شد</h2>
          <p className="mt-3 text-sm leading-7 text-green-800">اطلاعات هویتی و امتیازات شاهد با موفقیت برای مدرسه ارسال شد. نتیجه بررسی توسط مدرسه اعلام خواهد شد.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#194342] sm:text-4xl">پیش‌ثبت‌نام مدرسه</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#194342]/70">
          پیش‌ثبت‌نام در دو مرحله انجام می‌شود. اطلاعات مرحله اول و امتیازات مرحله دوم تا زمان تکمیل ثبت‌نام در همین مرورگر ذخیره می‌شوند و با رفرش صفحه از بین نمی‌روند.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        {[{ n: 1, title: "اطلاعات دانش‌آموز و خانواده" }, { n: 2, title: "امتیازات مدارس شاهد" }].map((item) => (
          <div key={item.n} className={`rounded-2xl border p-4 ${step === item.n ? "border-[#194342] bg-[#194342] text-white" : "border-[#194342]/10 bg-white text-[#194342]/60"}`}>
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${step === item.n ? "bg-white text-[#194342]" : "bg-[#194342]/10 text-[#194342]"}`}>{item.n}</span>
              <div>
                <div className="text-xs">مرحله {item.n}</div>
                <div className="mt-1 text-sm font-bold">{item.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {submitError && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">{submitError}</div>}

      {step === 1 ? (
        <form onSubmit={handleFirstStep} className="space-y-7">
          <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#194342]">اطلاعات دانش‌آموز</h2>
            <p className="mt-2 text-sm text-[#194342]/60">اطلاعات هویتی و تحصیلی دانش‌آموز</p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="نام" value={form.studentFirstName} onChange={(v) => updateForm("studentFirstName", v)} error={errors.studentFirstName} required placeholder="مثلاً سارا" />
              <Field label="نام خانوادگی" value={form.studentLastName} onChange={(v) => updateForm("studentLastName", v)} error={errors.studentLastName} required placeholder="مثلاً احمدی" />
              <div>
                <label className="mb-2 block text-sm font-medium text-[#194342]">تاریخ تولد *</label>
                <JalaliDatePicker value={form.birthDate} onChange={(v) => updateForm("birthDate", v)} placeholder="تاریخ تولد" className="!w-full rounded-xl border border-[#194342]/15 bg-[#FAF8F3] px-4 py-3 text-sm outline-none" />
                {errors.birthDate && <p className="mt-2 text-xs text-red-600">{errors.birthDate}</p>}
              </div>
              <Field label="کد ملی" value={form.nationalId} onChange={(v) => updateForm("nationalId", v)} error={errors.nationalId} required inputMode="numeric" />
              <Field label="سری شناسنامه" value={form.birthCertificateSerial} onChange={(v) => updateForm("birthCertificateSerial", v)} error={errors.birthCertificateSerial} required inputMode="numeric" />
              <div>
                <label className="mb-2 block text-sm font-medium text-[#194342]">پایه تحصیلی *</label>
                <select value={form.grade} onChange={(event) => updateForm("grade", event.target.value)} className={`w-full rounded-xl border bg-[#FAF8F3] px-4 py-3 text-sm outline-none focus:border-[#194342] ${errors.grade ? "border-red-400" : "border-[#194342]/15"}`}>
                  <option value="">انتخاب پایه</option>
                  <option value="دهم">دهم</option>
                  <option value="یازدهم">یازدهم</option>
                  <option value="دوازدهم">دوازدهم</option>
                </select>
                {errors.grade && <p className="mt-2 text-xs text-red-600">{errors.grade}</p>}
              </div>
              <Field label="شماره همراه دانش‌آموز" value={form.studentPhone} onChange={(v) => updateForm("studentPhone", v)} error={errors.studentPhone} required inputMode="tel" placeholder="09xxxxxxxxx" />
            </div>
          </section>

          <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#194342]">اطلاعات پدر</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="نام پدر" value={form.fatherFirstName} onChange={(v) => updateForm("fatherFirstName", v)} error={errors.fatherFirstName} required />
              <Field label="نام خانوادگی پدر" value={form.fatherLastName} onChange={(v) => updateForm("fatherLastName", v)} error={errors.fatherLastName} required />
              <Field label="کد ملی پدر" value={form.fatherNationalId} onChange={(v) => updateForm("fatherNationalId", v)} error={errors.fatherNationalId} required inputMode="numeric" />
              <Field label="شغل پدر" value={form.fatherJob} onChange={(v) => updateForm("fatherJob", v)} error={errors.fatherJob} required />
              <Field label="تحصیلات پدر" value={form.fatherEducation} onChange={(v) => updateForm("fatherEducation", v)} error={errors.fatherEducation} required />
              <Field label="شماره همراه پدر" value={form.fatherPhone} onChange={(v) => updateForm("fatherPhone", v)} error={errors.fatherPhone} required inputMode="tel" placeholder="09xxxxxxxxx" />
            </div>
          </section>

          <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#194342]">اطلاعات مادر</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="نام مادر" value={form.motherFirstName} onChange={(v) => updateForm("motherFirstName", v)} error={errors.motherFirstName} required />
              <Field label="نام خانوادگی مادر" value={form.motherLastName} onChange={(v) => updateForm("motherLastName", v)} error={errors.motherLastName} required />
              <Field label="کد ملی مادر" value={form.motherNationalId} onChange={(v) => updateForm("motherNationalId", v)} error={errors.motherNationalId} required inputMode="numeric" />
              <Field label="شغل مادر" value={form.motherJob} onChange={(v) => updateForm("motherJob", v)} error={errors.motherJob} required />
              <Field label="تحصیلات مادر" value={form.motherEducation} onChange={(v) => updateForm("motherEducation", v)} error={errors.motherEducation} required />
              <Field label="شماره همراه مادر" value={form.motherPhone} onChange={(v) => updateForm("motherPhone", v)} error={errors.motherPhone} required inputMode="tel" placeholder="09xxxxxxxxx" />
            </div>
          </section>

          <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#194342]">اطلاعات تماس و سکونت</h2>
            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#194342]">نشانی محل سکونت *</label>
                <textarea value={form.address} onChange={(event) => updateForm("address", event.target.value)} rows={4} className={`w-full rounded-xl border bg-[#FAF8F3] px-4 py-3 text-sm outline-none focus:border-[#194342] ${errors.address ? "border-red-400" : "border-[#194342]/15"}`} />
                {errors.address && <p className="mt-2 text-xs text-red-600">{errors.address}</p>}
              </div>
              <Field label="تلفن منزل" value={form.landlinePhone} onChange={(v) => updateForm("landlinePhone", v)} error={errors.landlinePhone} inputMode="tel" />
              <div>
                <label className="mb-2 block text-sm font-medium text-[#194342]">توضیحات</label>
                <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={3} className="w-full rounded-xl border border-[#194342]/15 bg-[#FAF8F3] px-4 py-3 text-sm outline-none focus:border-[#194342]" placeholder="در صورت نیاز توضیحات تکمیلی" />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" className="rounded-2xl bg-[#194342] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#123533]">ثبت اطلاعات و ادامه به مرحله دوم ←</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="space-y-7">
          <section className="rounded-3xl border border-[#194342]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#194342]">مرحله دوم: امتیازات مدارس شاهد</h2>
                <p className="mt-2 text-sm leading-7 text-[#194342]/65">امتیاز هر بند را بر اساس مدارک و شرایط خود وارد کنید. اطلاعات مرحله اول همچنان ذخیره شده است.</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-[#194342]/15 px-4 py-2.5 text-sm font-medium text-[#194342]">← ویرایش مرحله اول</button>
            </div>
          </section>

          <WitnessPointsTable values={witnessPoints} onChange={updateWitnessPoint} />

          <div className="rounded-2xl border border-[#194342]/10 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-[#194342]/60">مجموع امتیاز قابل ارسال</div>
                <div className="mt-1 text-2xl font-bold text-[#194342]">{totalScore.toLocaleString("fa-IR")} امتیاز</div>
              </div>
              <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-[#194342] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#123533] disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "در حال ثبت نهایی…" : "تکمیل و ارسال پیش‌ثبت‌نام"}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
