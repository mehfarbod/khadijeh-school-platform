"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowRight, Loader2, Mail, School } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function resolveRedirect(returnTo: string | null, fallback = "/admin") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function AuthInner() {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = resolveRedirect(searchParams?.get("returnTo") ?? null);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push(redirect);
  }, [authLoading, isAuthenticated, router, redirect]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (!email) {
      setError("ایمیل الزامی است.");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("فرمت ایمیل معتبر نیست.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "ارسال کد با خطا مواجه شد.");
      setStep({ email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال کد با خطا مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const email = step === "signIn" ? "" : step.email;
    const code = otp.trim();

    if (!/^\d{6}$/.test(code)) {
      setError("کد تأیید باید ۶ رقم باشد.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", { email, code, redirect: false });
      if (!result?.ok) throw new Error("کد تأیید نادرست است.");
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تأیید نادرست است.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

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
          {step === "signIn" ? (
            <>
              <CardHeader className="px-6 pb-5 pt-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#194342] shadow-sm">
                  <School className="h-7 w-7 text-[#DBE7C1]" strokeWidth={1.8} />
                </div>
                <CardTitle className="text-xl font-bold text-[#194342]">ورود کادر آموزشی</CardTitle>
                <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
                  برای ورود به پنل مدیریت، ایمیل سازمانی خود را وارد کنید.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleEmailSubmit} noValidate>
                <CardContent className="space-y-4 px-6 pb-6">
                  <div>
                    <label htmlFor="staff-email" className="mb-1.5 block text-xs font-medium text-[#344054]">
                      ایمیل
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-[#98A2B3]" />
                      <Input
                        id="staff-email"
                        name="email"
                        placeholder="email@example.com"
                        type="email"
                        className="h-11 border-[#D5DECB] bg-[#FCFDF9] pr-9 text-left"
                        dir="ltr"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs leading-5 text-destructive">{error}</p>}

                  <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                    دریافت کد ورود
                  </Button>

                  <p className="text-center text-[10.5px] leading-5 text-[#98A2B3]">
                    در حالت توسعه، کد تست در ترمینال برنامه نمایش داده می‌شود.
                  </p>
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="px-6 pb-5 pt-8 text-center">
                <CardTitle className="text-xl font-bold text-[#194342]">تأیید ایمیل</CardTitle>
                <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
                  کد ۶ رقمی ارسال‌شده به ایمیل شما را وارد کنید.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleOtpSubmit} noValidate>
                <CardContent className="space-y-5 px-6 pb-6">
                  <div className="rounded-xl border border-[#E1E8D6] bg-[#F1F5E8] px-3 py-2.5 text-center text-xs text-[#194342]" dir="ltr">
                    {step.email}
                  </div>

                  <div className="flex justify-center" dir="ltr">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading} dir="ltr">
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && <p className="text-center text-xs leading-5 text-destructive">{error}</p>}

                  <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                    تأیید و ورود
                  </Button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#98A2B3]">
                    <span>کد را دریافت نکردید؟</span>
                    <button type="button" className="font-medium text-[#B86F5B] hover:text-[#A45F4D]" onClick={() => { setStep("signIn"); setOtp(""); setError(null); }} disabled={isLoading}>
                      تلاش مجدد
                    </button>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-[#EEF2E8] px-6 py-4">
                  <Button type="button" variant="ghost" className="w-full text-xs text-[#667085] hover:text-[#194342]" onClick={() => { setStep("signIn"); setOtp(""); setError(null); }} disabled={isLoading}>
                    تغییر ایمیل
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}

export default function AuthClient() {
  return <Suspense><AuthInner /></Suspense>;
}
