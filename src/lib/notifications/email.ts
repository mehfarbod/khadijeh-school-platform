export async function sendEmailOtp({ to, code }: { to: string; code: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV STUDENT EMAIL OTP] " + to + ": " + code);
    return;
  }
  throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
}
