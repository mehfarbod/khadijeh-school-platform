import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "khadijeh_student_password_reset";
const RESET_MAX_AGE = 10 * 60;
const SECRET = process.env.NEXTAUTH_SECRET;

type PasswordResetPayload = {
  studentId: string;
  sessionVersion: number;
  exp: number;
};

function sign(value: string) {
  if (!SECRET) throw new Error("NEXTAUTH_SECRET is not configured.");
  return createHmac("sha256", SECRET)
    .update(`student-password-reset:${value}`)
    .digest("base64url");
}

function createToken(studentId: string, sessionVersion: number) {
  const payload: PasswordResetPayload = {
    studentId,
    sessionVersion,
    exp: Math.floor(Date.now() / 1000) + RESET_MAX_AGE,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token: string): PasswordResetPayload | null {
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
    ) as PasswordResetPayload;

    if (
      !payload.studentId ||
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

export async function createStudentPasswordResetSession(
  studentId: string,
  sessionVersion: number,
) {
  const cookieStore = await cookies();
  cookieStore.set(
    COOKIE_NAME,
    createToken(studentId, sessionVersion),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/student-auth",
      maxAge: RESET_MAX_AGE,
    },
  );
}

export async function getStudentPasswordResetSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  return token ? verifyToken(token) : null;
}

export async function clearStudentPasswordResetSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/student-auth",
    maxAge: 0,
  });
}
