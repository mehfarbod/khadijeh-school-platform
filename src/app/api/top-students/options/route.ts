import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requirePermission("top_students.manage");

    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: {
        id: true,
        title: true,
        classes: {
          where: { isActive: true },
          orderBy: [{ grade: "asc" }, { name: "asc" }],
          select: { id: true, grade: true, name: true },
        },
      },
    });

    return NextResponse.json({
      academicYear: academicYear
        ? { id: academicYear.id, title: academicYear.title }
        : null,
      classes: academicYear?.classes ?? [],
    });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : 500;

    return NextResponse.json(
      {
        error:
          status === 403
            ? "مجوز مدیریت دانش‌آموزان برتر را ندارید."
            : "خطا در دریافت گزینه‌های فرم",
      },
      { status }
    );
  }
}
