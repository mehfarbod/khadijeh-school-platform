export async function sendSmsOtp({ to, code }: { to: string; code: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV STUDENT SMS OTP] " + to + ": " + code);
    return;
  }
  throw new Error("SMS_PROVIDER_NOT_CONFIGURED");
}
