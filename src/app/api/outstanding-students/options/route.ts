import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requirePermission("top_students.manage");
    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true, title: true, isCurrent: true },
    });

    if (!currentYear) return NextResponse.json({ years: [], classes: [], students: [] });

    const [classes, students] = await Promise.all([
      prisma.class.findMany({
        where: { academicYearId: currentYear.id, isActive: true },
        orderBy: [{ grade: "asc" }, { name: "asc" }],
        select: { id: true, grade: true, name: true },
      }),
      prisma.student.findMany({
        where: { isActive: true, enrollments: { some: { academicYearId: currentYear.id } } },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          enrollments: {
            where: { academicYearId: currentYear.id },
            select: { academicYearId: true, grade: true, classId: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ years: [currentYear], classes, students });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت دانش‌آموزان ممتاز را ندارید." : "خطا در دریافت گزینه‌ها" }, { status });
  }
}
