import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const registrations = await prisma.courseRegistration.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/course-registrations error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز مشاهده ثبت‌نام‌ها را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در دریافت ثبت‌نام‌ها" },
      { status: 500 }
    );
  }
}