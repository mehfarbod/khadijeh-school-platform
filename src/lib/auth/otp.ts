import crypto from "crypto";

const OTP_HASH_PREFIX = "hmac-sha256";

function getOtpHashSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured.");
  return secret;
}

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string) {
  const digest = crypto
    .createHmac("sha256", getOtpHashSecret())
    .update("otp:")
    .update(code)
    .digest("hex");

  return `${OTP_HASH_PREFIX}$${digest}`;
}

export function verifyOtp(code: string, codeHash: string) {
  const candidate = codeHash.startsWith(`${OTP_HASH_PREFIX}$`)
    ? hashOtp(code)
    : crypto.createHash("sha256").update(code).digest("hex");
  const actual = Buffer.from(candidate, "utf8");
  const expected = Buffer.from(codeHash, "utf8");

  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}

export function getOtpExpiration() {
  return new Date(Date.now() + 5 * 60 * 1000);
}
