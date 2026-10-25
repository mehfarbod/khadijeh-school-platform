import { NextRequest, NextResponse } from "next/server";

import { rateLimitAdminPasswordLogin } from "@/lib/auth/admin-auth-rate-limit";
import { adminPasswordLoginSchema } from "@/lib/auth/admin-auth-validation";
import { loginAdminWithPassword } from "@/lib/auth/admin-password-login";
import {
  assertAdminSessionConfigured,
  createAdminSession,
} from "@/lib/auth/admin-session";

const INVALID_CREDENTIALS_MESSAGE = "کد ملی یا رمز عبور نادرست است.";

export async function POST(request: NextRequest) {
  try {
    assertAdminSessionConfigured();
    const body: unknown = await request.json();
    const result = adminPasswordLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "اطلاعات ورود معتبر نیست." },
        { status: 400 },
      );
    }

    const limit = rateLimitAdminPasswordLogin(request, result.data.nationalId);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const login = await loginAdminWithPassword(
      result.data.nationalId,
      result.data.password,
    );
    if (!login.success) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_MESSAGE },
        { status: 401 },
      );
    }

    await createAdminSession(login.userId, login.sessionVersion);

    return NextResponse.json({
      success: true,
      mustChangePassword: login.mustChangePassword,
    });
  } catch {
    console.error("Admin password login failed internally.");
    return NextResponse.json(
      { error: "خطایی در ورود به پنل رخ داد." },
      { status: 500 },
    );
  }
}
