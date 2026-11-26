/**
 * Provider-agnostic SMS boundary for student password recovery.
 * Keep callers independent of a future provider; replace only the production
 * branch when credentials and a provider contract are available.
 */
export async function sendSmsOtp({ to, code }: { to: string; code: string }) {
  if (canExposeLocalDevelopmentOtp()) {
    console.info(`[LOCAL DEV STUDENT SMS OTP] ${maskPhone(to)}: ${code}`);
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
  if (canExposeLocalDevelopmentOtp()) {
    console.info(
      `[LOCAL DEV ADMIN PASSWORD RESET OTP] ${maskPhone(to)}: ${code}`,
    );
    return;
  }

  throw new Error("SMS_PROVIDER_NOT_CONFIGURED");
}

function canExposeLocalDevelopmentOtp() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_EXPOSE_AUTH_OTP === "true"
  );
}

function maskPhone(phone: string) {
  if (phone.length < 4) return "***";
  return `${phone.slice(0, 2)}*******${phone.slice(-2)}`;
}
