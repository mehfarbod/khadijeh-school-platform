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

/**
 * Provider-agnostic boundary for admin password recovery. Production stays
 * fail-closed until a real SMS provider is deliberately configured.
 */
export async function sendAdminPasswordResetOtp({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[DEV ADMIN PASSWORD RESET OTP] " + to + ": " + code);
    return;
  }

  throw new Error("SMS_PROVIDER_NOT_CONFIGURED");
}
