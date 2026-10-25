import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const COOKIE_NAME = "khadijeh_admin_password_reset";
const RESET_MAX_AGE = 10 * 60;
const SECRET = process.env.NEXTAUTH_SECRET;

type AdminPasswordResetPayload = {
  userId: string;
  sessionVersion: number;
  exp: number;
};

function getSecret() {
  if (!SECRET) throw new Error("NEXTAUTH_SECRET is not configured.");
  return SECRET;
}

export function assertAdminPasswordResetSessionConfigured() {
  getSecret();
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(`admin-password-reset:${value}`)
    .digest("base64url");
}

function createToken(userId: string, sessionVersion: number) {
  const payload: AdminPasswordResetPayload = {
    userId,
    sessionVersion,
    exp: Math.floor(Date.now() / 1000) + RESET_MAX_AGE,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token: string): AdminPasswordResetPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  let expected: string;
  try {
    expected = sign(encodedPayload);
  } catch {
    return null;
  }

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminPasswordResetPayload;
    if (
      !payload.userId ||
      typeof payload.sessionVersion !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createAdminPasswordResetSession(
  userId: string,
  sessionVersion: number,
) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(userId, sessionVersion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/admin-auth",
    maxAge: RESET_MAX_AGE,
  });
}

export async function getAdminPasswordResetSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  return token ? verifyToken(token) : null;
}

export async function clearAdminPasswordResetSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/admin-auth",
    maxAge: 0,
  });
}
