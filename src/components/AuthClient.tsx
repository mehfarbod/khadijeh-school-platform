
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
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function resolveRedirect(returnTo: string | null, fallback = "/admin") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }

  return fallback;
}

function AuthInner() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    signIn,
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = resolveRedirect(
    searchParams?.get("returnTo") ?? null
  );

  const [step, setStep] = useState<"signIn" | { email: string }>(
    "signIn"
  );
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirect);
    }
  }, [authLoading, isAuthenticated, router, redirect]);

  const handleEmailSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();

      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "ارسال کد با خطا مواجه شد."
        );
      }

      setStep({ email });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ارسال کد با خطا مواجه شد."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const email = String(formData.get("email") ?? "");
      const code = String(formData.get("code") ?? "");

      const result = await signIn("credentials", {
        email,
        code,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error("کد تأیید نادرست است.");
      }

      router.push(redirect);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "کد تأیید نادرست است."
      );

      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="min-w-[350px] pb-0 border shadow-sm">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
                    خ
                  </div>
                </div>

                <CardTitle className="text-lg">
                  ورود به پنل مدیریت
                </CardTitle>

                <CardDescription className="text-xs">
                  ایمیل خود را وارد کنید
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                      <Input
                        name="email"
                        placeholder="email@example.com"
                        type="email"
                        className="pl-9"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {error && (
                    <p className="mt-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle className="text-lg">
                  تأیید ایمیل
                </CardTitle>

                <CardDescription className="text-xs">
                  کد تأیید به {step.email} ارسال شد
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input
                    type="hidden"
                    name="email"
                    value={step.email}
                  />

                  <input
                    type="hidden"
                    name="code"
                    value={otp}
                  />

                  <div className="flex justify-center" dir="ltr">
                    <InputOTP
  value={otp}
  onChange={setOtp}
  maxLength={6}
  disabled={isLoading}
  dir="ltr"
>
  <InputOTPGroup>
    {Array.from({ length: 6 }).map((_, i) => (
      <InputOTPSlot
        key={i}
        index={i}
      />
    ))}
  </InputOTPGroup>
</InputOTP>
                  </div>

                  {error && (
                    <p className="mt-2 text-sm text-destructive text-center">
                      {error}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    کد دریافت نکردید؟{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={() => {
                        setStep("signIn");
                        setOtp("");
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      تلاش مجدد
                    </Button>
                  </p>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isLoading || otp.length !== 6
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        تأیید...
                      </>
                    ) : (
                      <>
                        تأیید کد
                        <ArrowLeft className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("signIn");
                      setOtp("");
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="w-full text-xs"
                  >
                    تغییر ایمیل
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AuthClient() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  );
}

