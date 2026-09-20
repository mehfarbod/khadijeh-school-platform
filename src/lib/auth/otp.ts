import crypto from "crypto";

export function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

export function verifyOtp(code: string, codeHash: string) {
  return hashOtp(code) === codeHash;
}

export function getOtpExpiration() {
  return new Date(Date.now() + 5 * 60 * 1000);
}