import { NextResponse } from "next/server";
import { clearStudentSession } from "@/lib/auth/student-session";
import { clearStudentPasswordResetSession } from "@/lib/auth/student-password-reset-session";

export async function POST() {
  await Promise.all([
    clearStudentSession(),
    clearStudentPasswordResetSession(),
  ]);
  return NextResponse.json({ success: true });
}
