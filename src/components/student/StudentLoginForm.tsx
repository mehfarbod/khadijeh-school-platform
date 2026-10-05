"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStudentPasswordChangeUrl } from "@/lib/auth/student-return-to";

export default function StudentLoginForm({ returnTo = "/portal" }: { returnTo?: string }) {
  const router = useRouter();
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/student-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId, password }),
      });
      const data = (await response.json()) as {
        error?: string;
        mustChangePassword?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "ورود به پرتال انجام نشد.");
      }

      router.replace(
        data.mustChangePassword
          ? getStudentPasswordChangeUrl(returnTo)
          : returnTo,
      );
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "ورود به پرتال انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8F2] px-4 py-8 sm:px-6" dir="rtl">
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
              {returnTo.startsWith("/courses/registration")
                ? "برای ثبت‌نام در دوره، ابتدا وارد حساب دانش‌آموزی خود شوید."
                : "با کد ملی و رمز عبور وارد شوید. در نخستین ورود، رمز اولیه همان کد ملی شماست."}
            </CardDescription>
          </CardHeader>

          <form onSubmit={login} noValidate>
            <CardContent className="space-y-4 px-6 pb-7">
              <div>
                <label htmlFor="student-national-id" className="mb-1.5 block text-xs font-medium text-[#344054]">
                  کد ملی
                </label>
                <Input
                  id="student-national-id"
                  value={nationalId}
                  onChange={(event) => setNationalId(event.target.value)}
                  placeholder="کد ملی ۱۰ رقمی"
                  disabled={loading}
                  autoComplete="username"
                  dir="ltr"
                  inputMode="numeric"
                  className="h-11 border-[#D5DECB] bg-[#FCFDF9] text-center"
                />
              </div>

              <div>
                <label htmlFor="student-password" className="mb-1.5 block text-xs font-medium text-[#344054]">
                  رمز عبور
                </label>
                <Input
                  id="student-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-11 border-[#D5DECB] bg-[#FCFDF9]"
                />
              </div>

              {error && <p className="text-xs leading-5 text-destructive">{error}</p>}

              <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={loading}>
                {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <LogIn className="ml-2 h-4 w-4" />}
                ورود
              </Button>

              <Link href="/portal/forgot-password" className="flex items-center justify-center gap-1 text-xs font-medium text-[#B86F5B] hover:text-[#A45F4D]">
                رمز عبورم را فراموش کرده‌ام
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </form>
        </Card>
      </div>
    </main>
  );
}
