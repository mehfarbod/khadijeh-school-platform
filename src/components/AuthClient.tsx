"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, School } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function resolveRedirect(returnTo: string | null, fallback = "/admin") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function AuthInner() {
  const { isLoading: authLoading, isAuthenticated, mustChangePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = resolveRedirect(searchParams?.get("returnTo") ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (mustChangePassword) router.replace("/auth/change-password");
    else if (isAuthenticated) router.replace(redirect);
  }, [authLoading, isAuthenticated, mustChangePassword, redirect, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const nationalId = String(formData.get("nationalId") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/admin-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId, password }),
      });
      const data = (await response.json()) as { error?: string; mustChangePassword?: boolean };
      if (!response.ok) {
        throw new Error(
          response.status === 429
            ? (data.error ?? "لطفاً کمی بعد دوباره تلاش کنید.")
            : "کد ملی یا رمز عبور نادرست است.",
        );
      }

      router.replace(data.mustChangePassword ? "/auth/change-password" : redirect);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "کد ملی یا رمز عبور نادرست است.");
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
          <CardHeader className="px-6 pb-5 pt-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#194342] shadow-sm">
              <School className="h-7 w-7 text-[#DBE7C1]" strokeWidth={1.8} />
            </div>
            <CardTitle className="text-xl font-bold text-[#194342]">ورود کادر آموزشی</CardTitle>
            <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
              برای ورود به پنل مدیریت، کد ملی و رمز عبور خود را وارد کنید.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4 px-6 pb-7">
              <div>
                <label htmlFor="staff-national-id" className="mb-1.5 block text-xs font-medium text-[#344054]">کد ملی</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-3 h-4 w-4 text-[#98A2B3]" />
                  <Input id="staff-national-id" name="nationalId" placeholder="کد ملی ۱۰ رقمی" inputMode="numeric" autoComplete="username" dir="ltr" className="h-11 border-[#D5DECB] bg-[#FCFDF9] pr-9 text-center" disabled={isLoading} required />
                </div>
              </div>
              <div>
                <label htmlFor="staff-password" className="mb-1.5 block text-xs font-medium text-[#344054]">رمز عبور</label>
                <Input id="staff-password" name="password" type="password" autoComplete="current-password" dir="ltr" className="h-11 border-[#D5DECB] bg-[#FCFDF9] text-left" disabled={isLoading} required />
              </div>
              {error && <p className="text-center text-xs leading-5 text-destructive" role="alert">{error}</p>}
              <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={isLoading || authLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                ورود به پنل مدیریت
              </Button>
              <Link
                href={
                  redirect === "/admin"
                    ? "/auth/forgot-password"
                    : `/auth/forgot-password?returnTo=${encodeURIComponent(redirect)}`
                }
                className="flex items-center justify-center gap-1 text-xs font-medium text-[#B86F5B] transition-colors hover:text-[#A45F4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] focus-visible:ring-offset-2"
              >
                فراموشی رمز عبور
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default function AuthClient() {
  return <Suspense><AuthInner /></Suspense>;
}
