"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentPortalLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.accountType === "student") {
      router.replace("/portal");
    }
  }, [status, session, router]);

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

      if (!response.ok) {
        throw new Error(data.error ?? "ارسال کد با خطا مواجه شد.");
      }

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
      const result = await signIn("student-credentials", {
        identifier,
        code: otp,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error("کد تأیید نادرست است.");
      }

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
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              خ
            </div>
            <CardTitle>ورود به پرتال دانش‌آموز</CardTitle>
            <CardDescription>
              {step === "identifier"
                ? "شماره موبایل خود را وارد کنید."
                : "کد ۶ رقمی ارسال‌شده را وارد کنید."}
            </CardDescription>
          </CardHeader>

          {step === "identifier" ? (
            <form onSubmit={requestOtp} noValidate>
              <CardContent className="space-y-4">
                <Input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="شماره موبایل"
                  disabled={loading}
                  autoComplete="tel"
                  dir="ltr"
                  inputMode="tel"
                />

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  )}
                  دریافت کد تأیید
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  در حالت توسعه، کد تست در ترمینال برنامه نمایش داده می‌شود.
                </p>
              </CardContent>
            </form>
          ) : (
            <form onSubmit={verifyOtp} noValidate>
              <CardContent className="space-y-5">
                <div className="rounded-lg bg-muted px-3 py-2 text-center text-sm" dir="ltr">
                  {identifier}
                </div>

                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={loading}
                    dir="ltr"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="text-center text-sm text-destructive">{error}</p>
                )}

                <Button
                  className="w-full"
                  type="submit"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  ورود به پرتال
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                  onClick={() => {
                    setStep("identifier");
                    setOtp("");
                    setError(null);
                  }}
                >
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
