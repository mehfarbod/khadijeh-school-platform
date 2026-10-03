import { NextRequest, NextResponse } from "next/server";

import { rateLimitStudentAuth } from "@/lib/auth/student-auth-rate-limit";
import { studentLoginSchema } from "@/lib/auth/student-auth-validation";
import { loginStudentWithPassword } from "@/lib/auth/student-password-login";
import { createStudentSession } from "@/lib/auth/student-session";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = studentLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "اطلاعات ورود معتبر نیست." },
        { status: 400 },
      );
    }

    const limit = rateLimitStudentAuth(
      request,
      "student-auth:password-login",
      result.data.nationalId,
      { ipLimit: 10, identifierLimit: 5, windowMs: 15 * 60 * 1000 },
    );

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const login = await loginStudentWithPassword(
      result.data.nationalId,
      result.data.password,
    );

    if (!login.success) {
      return NextResponse.json(
        { error: "کد ملی یا رمز عبور نادرست است." },
        { status: 401 },
      );
    }

    await createStudentSession(login.studentId, login.sessionVersion);

    return NextResponse.json({
      success: true,
      mustChangePassword: login.mustChangePassword,
    });
  } catch (error) {
    console.error("Student password login error:", error);
    return NextResponse.json(
      { error: "خطایی در ورود به پرتال رخ داد." },
      { status: 500 },
    );
  }
}
