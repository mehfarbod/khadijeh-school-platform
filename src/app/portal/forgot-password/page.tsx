"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import StudentPasswordField from "@/components/student/StudentPasswordField";

type Step = "national-id" | "otp" | "password" | "success";

export default function StudentForgotPasswordPage() {
  const [step, setStep] = useState<Step>("national-id");
  const [nationalId, setNationalId] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit("/api/student-auth/request-otp", { nationalId }, () => setStep("otp"));
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit("/api/student-auth/verify-otp", { nationalId, code: otp }, () => setStep("password"));
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit("/api/student-auth/reset-password", { password, confirmPassword }, () => setStep("success"));
  }

  async function submit(
    url: string,
    body: Record<string, string>,
    onSuccess: () => void,
  ) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "انجام درخواست با خطا مواجه شد.");
      }
      onSuccess();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "انجام درخواست با خطا مواجه شد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8F2] px-4 py-8 sm:px-6" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <Link href="/portal/login" className="inline-flex items-center gap-2 text-xs font-medium text-[#667085] hover:text-[#194342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2">
            <ArrowRight className="h-3.5 w-3.5" />
            بازگشت به ورود
          </Link>
        </div>

        <Card className="overflow-hidden rounded-2xl border-[#E1E8D6] bg-white shadow-[0_16px_45px_rgba(25,67,66,0.08)]">
          <div className="h-1.5 bg-[#194342]" />
          <CardHeader className="px-6 pb-5 pt-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#194342]">
              {step === "success" ? <CheckCircle2 className="h-7 w-7 text-[#DBE7C1]" /> : <KeyRound className="h-7 w-7 text-[#DBE7C1]" />}
            </div>
            <CardTitle className="text-xl font-bold text-[#194342]">
              {step === "success" ? "رمز عبور تغییر کرد" : "بازیابی رمز عبور"}
            </CardTitle>
            <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
              {descriptionForStep(step)}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-7">
            {step === "national-id" && (
              <form onSubmit={requestOtp} className="space-y-4" noValidate>
                <Field label="کد ملی" id="recovery-national-id">
                  <Input id="recovery-national-id" value={nationalId} onChange={(event) => setNationalId(event.target.value)} inputMode="numeric" autoComplete="username" dir="ltr" disabled={loading} aria-invalid={error ? true : undefined} aria-describedby={error ? "forgot-password-error" : undefined} className="h-11 border-[#D5DECB] bg-[#FCFDF9] text-center" />
                </Field>
                <ErrorMessage error={error} />
                <SubmitButton loading={loading}>ارسال کد تأیید</SubmitButton>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={verifyOtp} className="space-y-5" noValidate>
                <div className="rounded-xl border border-[#E1E8D6] bg-[#F1F5E8] px-3 py-2.5 text-center text-xs text-[#194342]" dir="ltr">{nationalId}</div>
                <div className="flex justify-center" dir="ltr">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={loading} dir="ltr" aria-label="کد تأیید شش رقمی" aria-invalid={error ? true : undefined} aria-describedby={error ? "forgot-password-error" : undefined}>
                    <InputOTPGroup>{Array.from({ length: 6 }).map((_, index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
                  </InputOTP>
                </div>
                <ErrorMessage error={error} />
                <SubmitButton loading={loading} disabled={otp.length !== 6}>تأیید کد</SubmitButton>
                <Button type="button" variant="ghost" className="w-full text-xs text-[#667085]" disabled={loading} onClick={() => { setStep("national-id"); setOtp(""); setError(null); }}>تغییر کد ملی یا ارسال دوباره</Button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={resetPassword} className="space-y-4" noValidate>
                <StudentPasswordField id="recovery-password" label="رمز عبور جدید" value={password} onChange={setPassword} autoComplete="new-password" disabled={loading} errorId={error ? "forgot-password-error" : undefined} />
                <StudentPasswordField id="recovery-password-confirm" label="تکرار رمز عبور جدید" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" disabled={loading} errorId={error ? "forgot-password-error" : undefined} />
                <p className="text-[11px] leading-5 text-[#667085]">رمز عبور باید حداقل ۸ نویسه باشد و با کد ملی شما یکسان نباشد.</p>
                <ErrorMessage error={error} />
                <SubmitButton loading={loading}>ثبت رمز عبور جدید</SubmitButton>
              </form>
            )}

            {step === "success" && (
              <div className="space-y-5 text-center">
                <p className="text-sm leading-7 text-[#344054]">اکنون می‌توانید با کد ملی و رمز عبور جدید وارد پرتال شوید.</p>
                <Button asChild className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]"><Link href="/portal/login">ادامه به صفحه ورود</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function descriptionForStep(step: Step) {
  if (step === "national-id") return "کد ملی خود را وارد کنید تا کد تأیید به شماره ثبت‌شده ارسال شود.";
  if (step === "otp") return "کد تأیید ارسال‌شده به شماره ثبت‌شده را وارد کنید.";
  if (step === "password") return "یک رمز عبور تازه برای حساب خود تعیین کنید.";
  return "رمز عبور جدید با موفقیت ثبت شد.";
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#344054]">{label}</label>{children}</div>;
}

function ErrorMessage({ error }: { error: string | null }) {
  return error ? <p id="forgot-password-error" role="alert" className="text-xs leading-5 text-destructive">{error}</p> : null;
}

function SubmitButton({ loading, disabled = false, children }: { loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  return <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={loading || disabled}>{loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}{children}</Button>;
}
