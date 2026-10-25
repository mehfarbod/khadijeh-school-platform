"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, School } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminChangePasswordPage() {
  const { isLoading: authLoading, mustChangePassword } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !mustChangePassword) router.replace("/auth");
  }, [authLoading, mustChangePassword, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    try {
      const response = await fetch("/api/admin-auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "تغییر رمز عبور با خطا مواجه شد.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "تغییر رمز عبور با خطا مواجه شد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !mustChangePassword) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8F2]">
        <Loader2 className="h-6 w-6 animate-spin text-[#194342]" />
      </main>
    );
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
              <School className="h-7 w-7 text-[#DBE7C1]" strokeWidth={1.8} />
            </div>
            <CardTitle className="text-xl font-bold text-[#194342]">تغییر رمز عبور</CardTitle>
            <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
              برای ادامه، یک رمز عبور جدید و امن انتخاب کنید.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4 px-6 pb-7">
              <div>
                <label htmlFor="new-admin-password" className="mb-1.5 block text-xs font-medium text-[#344054]">رمز عبور جدید</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-3 h-4 w-4 text-[#98A2B3]" />
                  <Input id="new-admin-password" name="password" type="password" autoComplete="new-password" dir="ltr" className="h-11 border-[#D5DECB] bg-[#FCFDF9] pr-9 text-left" disabled={isSubmitting} required />
                </div>
              </div>
              <div>
                <label htmlFor="confirm-admin-password" className="mb-1.5 block text-xs font-medium text-[#344054]">تکرار رمز عبور جدید</label>
                <Input id="confirm-admin-password" name="confirmPassword" type="password" autoComplete="new-password" dir="ltr" className="h-11 border-[#D5DECB] bg-[#FCFDF9] text-left" disabled={isSubmitting} required />
              </div>
              {error && <p className="text-center text-xs leading-5 text-destructive" role="alert">{error}</p>}
              <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                ثبت رمز عبور جدید
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </main>
  );
}
