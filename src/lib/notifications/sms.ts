/**
 * Provider-agnostic SMS boundary for student password recovery.
 * Keep callers independent of a future provider; replace only the production
 * branch when credentials and a provider contract are available.
 */
export async function sendSmsOtp({ to, code }: { to: string; code: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV STUDENT SMS OTP] " + to + ": " + code);
    return;
  }
  throw new Error("SMS_PROVIDER_NOT_CONFIGURED");
}
