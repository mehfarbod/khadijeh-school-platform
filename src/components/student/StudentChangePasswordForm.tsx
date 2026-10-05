"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StudentLogoutButton from "@/components/student/StudentLogoutButton";
import StudentPasswordField from "@/components/student/StudentPasswordField";

export default function StudentChangePasswordForm({ returnTo = "/portal" }: { returnTo?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/student-auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "تغییر رمز عبور انجام نشد.");
      }

      router.replace(returnTo);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "تغییر رمز عبور انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8F2] px-4 py-8 sm:px-6" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <Card className="overflow-hidden rounded-2xl border-[#E1E8D6] bg-white shadow-[0_16px_45px_rgba(25,67,66,0.08)]">
          <div className="h-1.5 bg-[#194342]" />
          <CardHeader className="px-6 pb-5 pt-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#194342]">
              <KeyRound className="h-7 w-7 text-[#DBE7C1]" />
            </div>
            <CardTitle className="text-xl font-bold text-[#194342]">تعیین رمز عبور جدید</CardTitle>
            <CardDescription className="mt-2 text-xs leading-6 text-[#667085]">
              برای حفظ امنیت حساب، پیش از ورود به پرتال رمز اولیه خود را تغییر دهید.
            </CardDescription>
          </CardHeader>

          <form onSubmit={changePassword} noValidate>
            <CardContent className="space-y-4 px-6 pb-7">
              <StudentPasswordField id="new-password" label="رمز عبور جدید" value={password} onChange={setPassword} autoComplete="new-password" disabled={loading} errorId={error ? "change-password-error" : undefined} />
              <StudentPasswordField id="confirm-password" label="تکرار رمز عبور جدید" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" disabled={loading} errorId={error ? "change-password-error" : undefined} />

              <p className="text-[11px] leading-5 text-[#667085]">
                رمز عبور باید حداقل ۸ نویسه باشد و با کد ملی شما یکسان نباشد.
              </p>
              {error && <p id="change-password-error" role="alert" className="text-xs leading-5 text-destructive">{error}</p>}

              <Button type="submit" className="h-11 w-full bg-[#B86F5B] text-white hover:bg-[#A45F4D]" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                ثبت رمز عبور و ادامه
              </Button>

              <div className="flex justify-center">
                <StudentLogoutButton />
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </main>
  );
}
