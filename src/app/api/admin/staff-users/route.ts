import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

export async function GET(_request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: [
        { name: "asc" },
        { email: "asc" },
      ],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/admin/staff-users error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز مشاهده حساب‌های پنل را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در دریافت حساب‌های پنل" },
      { status: 500 }
    );
  }
}
