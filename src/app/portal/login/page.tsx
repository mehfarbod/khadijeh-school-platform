"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, GraduationCap, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudentPortalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = identifier.trim();

    if (!value) {
      setError("شماره موبایل خود را وارد کنید.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/student-auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "ارسال کد با خطا مواجه شد.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال کد با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("کد تأیید باید ۶ رقم باشد.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/student-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "کد تأیید نادرست است.");
      router.replace("/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تأیید نادرست است.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8F2] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#667085] transition-colors hover:text-[#194342]">
            <ArrowRight className="h-3.5 w-3.5" />
            بازگشت به سایت
          </Link>
        </div>

        <Card className="overflow-hidden rounded-2xl border-[#E1E8D6] bg-white shadow-[0_16px_45px_rgba(25,67,66,0.08)]">
          <div className="h-1.5 bg-[#194342]" />
          <CardHeader className="px-6 pb-5 pt-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#194342] shadow-sm">
              <GraduationCap className="h-7 w-7 text-[#DBE7C1]" strokeWidth={1.8} />
            </div>
            <CardTitle className="text-xl font-bold text-[#194342]">ورود دانش‌آموزان</CardTitle>
            <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
              برای ورود به پرتال دانش‌آموز، شماره موبایل خود را وارد کنید.
            </CardDescription>
          </CardHeader>

          {step === "identifier" ? (
            <form onSubmit={requestOtp} noValidate>
              <CardContent className="space-y-4 px-6 pb-7">
                <div>
                  <label htmlFor="student-mobile" className="mb-1.5 block text-xs font-medium text-[#344054]">
                    شماره موبایل
                  </label>
                  <Input
                    id="student-mobile"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="09xxxxxxxxx"
                    disabled={loading}
                    autoComplete="tel"
                    dir="ltr"
                    inputMode="tel"
                    className="h-11 border-[#D5DECB] bg-[#FCFDF9] text-center"
                  />
                </div>

                {error && <p className="text-xs leading-5 text-destructive">{error}</p>}

                <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                  دریافت کد تأیید
                </Button>

                <p className="text-center text-[10.5px] leading-5 text-[#98A2B3]">
                  در حالت توسعه، کد تست در ترمینال برنامه نمایش داده می‌شود.
                </p>
              </CardContent>
            </form>
          ) : (
            <form onSubmit={verifyOtp} noValidate>
              <CardContent className="space-y-5 px-6 pb-7">
                <div className="rounded-xl border border-[#E1E8D6] bg-[#F1F5E8] px-3 py-2.5 text-center text-xs text-[#194342]" dir="ltr">
                  {identifier}
                </div>

                <div className="flex justify-center" dir="ltr">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={loading} dir="ltr">
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => <InputOTPSlot key={index} index={index} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && <p className="text-center text-xs leading-5 text-destructive">{error}</p>}

                <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={loading || otp.length !== 6}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  ورود به پرتال
                </Button>

                <div className="flex items-center justify-center gap-1 text-[11px] text-[#98A2B3]">
                  <span>کد را دریافت نکردید؟</span>
                  <button type="button" className="font-medium text-[#B86F5B] hover:text-[#A45F4D]" onClick={() => { setStep("identifier"); setOtp(""); setError(null); }} disabled={loading}>
                    تلاش مجدد
                  </button>
                </div>

                <Button type="button" variant="ghost" className="w-full text-xs text-[#667085] hover:text-[#194342]" disabled={loading} onClick={() => { setStep("identifier"); setOtp(""); setError(null); }}>
                  تغییر شماره موبایل
                </Button>
              </CardContent>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
