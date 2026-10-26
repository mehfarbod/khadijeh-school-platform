import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission, requireRole } from "@/lib/auth/authorization";
import { getTeacherClassIds } from "@/lib/auth/teacher-access";

const classSchema = z.object({
  academicYearId: z.string().trim().min(1, "سال تحصیلی الزامی است."),
  grade: z.string().trim().min(1, "پایه تحصیلی الزامی است.").max(30),
  name: z.string().trim().min(1, "نام کلاس الزامی است.").max(100),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId") || undefined;
    const grade = searchParams.get("grade") || undefined;
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const teacherClassIds = session.user.role === "TEACHER"
      ? await getTeacherClassIds(session.user.id, academicYearId)
      : null;

    if (session.user.role !== "TEACHER") {
      await requirePermission("students.view");
    }

    const classes = await prisma.class.findMany({
      where: {
        ...(academicYearId ? { academicYearId } : {}),
        ...(grade ? { grade } : {}),
        ...(activeOnly ? { isActive: true } : {}),
        ...(teacherClassIds ? { id: { in: teacherClassIds } } : {}),
      },
      include: {
        academicYear: {
          select: { id: true, title: true, isCurrent: true },
        },
        _count: {
          select: {
            enrollments: true,
            teacherAssignments: true,
          },
        },
        teacherAssignments: {
          where: teacherClassIds ? { teacherId: session.user.id } : undefined,
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                role: true,
                staff: {
                  select: {
                    firstName: true,
                    lastName: true,
                    subject: true,
                  },
                },
              },
            },
          },
          orderBy: [{ subject: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [
        { academicYear: { isCurrent: "desc" } },
        { grade: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("GET /api/admin/classes error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مشاهده کلاس‌ها را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "خطا در دریافت کلاس‌ها." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Teachers may read their assigned classes, but class creation is a
    // management operation and must never be granted through a teacher's
    // permission overrides.
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.create");

    const parsed = classSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "اطلاعات کلاس معتبر نیست.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "سال تحصیلی انتخاب‌شده یافت نشد." }, { status: 400 });
    }

    try {
      const created = await prisma.class.create({
        data: {
          academicYearId: data.academicYearId,
          grade: data.grade,
          name: data.name,
          isActive: data.isActive ?? true,
        },
        include: {
          academicYear: true,
          _count: {
            select: { enrollments: true, teacherAssignments: true },
          },
        },
      });

      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "این کلاس قبلاً برای همین سال تحصیلی و پایه ثبت شده است." },
          { status: 409 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("POST /api/admin/classes error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز ایجاد کلاس را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "ایجاد کلاس انجام نشد." }, { status: 500 });
  }
}
