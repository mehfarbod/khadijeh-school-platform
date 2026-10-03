import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "khadijeh_student_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SECRET = process.env.NEXTAUTH_SECRET;

type StudentSessionPayload = {
  studentId: string;
  sessionVersion: number;
  exp: number;
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  if (!SECRET) throw new Error("NEXTAUTH_SECRET is not configured.");
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function createToken(studentId: string, sessionVersion: number) {
  const payload: StudentSessionPayload = {
    studentId,
    sessionVersion,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return encodedPayload + "." + sign(encodedPayload);
}

function verifyToken(token: string): StudentSessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  let expected: string;
  try { expected = sign(encodedPayload); } catch { return null; }

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as StudentSessionPayload;
    if (
      !payload.studentId ||
      typeof payload.sessionVersion !== "number" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) return null;
    return payload;
  } catch { return null; }
}

export async function createStudentSession(
  studentId: string,
  sessionVersion: number,
) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(studentId, sessionVersion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

async function getStudentSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthenticatedStudent() {
  const payload = await getStudentSessionPayload();
  if (!payload) return null;

  return prisma.student.findFirst({
    where: {
      id: payload.studentId,
      isActive: true,
      studentAccount: {
        is: {
          isActive: true,
          sessionVersion: payload.sessionVersion,
        },
      },
    },
    include: {
      studentAccount: {
        select: {
          id: true,
          isActive: true,
          mustChangePassword: true,
          sessionVersion: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      enrollments: {
        include: { academicYear: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getCurrentStudent() {
  const student = await getAuthenticatedStudent();

  if (student?.studentAccount?.mustChangePassword) return null;

  return student;
}

export async function requireStudent() {
  const student = await getCurrentStudent();
  if (!student) throw new Error("UNAUTHORIZED");
  return student;
}

export async function requireStudentPasswordChange() {
  const student = await getAuthenticatedStudent();

  if (!student) throw new Error("UNAUTHORIZED");
  if (!student.studentAccount?.mustChangePassword) {
    throw new Error("PASSWORD_CHANGE_NOT_REQUIRED");
  }

  return student;
}
