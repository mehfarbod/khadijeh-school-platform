import { NextResponse } from "next/server";

import { requireStudent } from "@/lib/auth/student-session";
import { getCurrentStudentGrade } from "@/lib/student-current-grade";

export async function GET() {
  try {
    const student = await requireStudent();
    const grade = getCurrentStudentGrade(student.enrollments);

    if (!grade) {
      return NextResponse.json(
        { error: "ثبت‌نام تحصیلی فعالی برای سال جاری پیدا نشد." },
        { status: 422 },
      );
    }

    return NextResponse.json({
      firstName: student.firstName,
      lastName: student.lastName,
      grade,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "برای ثبت‌نام در دوره، ابتدا وارد حساب دانش‌آموزی خود شوید." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات دانش‌آموز." },
      { status: 500 },
    );
  }
}
