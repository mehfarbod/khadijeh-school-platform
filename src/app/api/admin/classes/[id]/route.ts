import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireRole } from "@/lib/auth/authorization";

const updateSchema = z.object({
  grade: z.string().trim().min(1).max(30).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.edit");

    const { id } = await context.params;
    const parsed = updateSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "اطلاعات کلاس معتبر نیست.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.class.findUnique({
      where: { id },
      select: { id: true, academicYearId: true, grade: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "کلاس موردنظر یافت نشد." }, { status: 404 });
    }

    const nextGrade = parsed.data.grade ?? existing.grade;
    const nextName = parsed.data.name ?? existing.name;

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const updatedClass = await tx.class.update({
          where: { id },
          data: parsed.data,
        });

        if (parsed.data.grade !== undefined || parsed.data.name !== undefined) {
          await tx.studentEnrollment.updateMany({
            where: { classId: id },
            data: {
              grade: nextGrade,
              className: nextName,
            },
          });
        }

        return updatedClass;
      });

      const result = await prisma.class.findUnique({
        where: { id: updated.id },
        include: {
          academicYear: true,
          _count: {
            select: { enrollments: true, teacherAssignments: true },
          },
          teacherAssignments: {
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  staff: {
                    select: { firstName: true, lastName: true, subject: true },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json(result);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "کلاسی با این مشخصات قبلاً برای این سال تحصیلی ثبت شده است." },
          { status: 409 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("PATCH /api/admin/classes/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز ویرایش کلاس را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "ویرایش کلاس انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.manage_status");

    const { id } = await context.params;

    const existing = await prisma.class.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "کلاس موردنظر یافت نشد." }, { status: 404 });
    }

    await prisma.class.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/classes/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز غیرفعال‌سازی کلاس را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "غیرفعال‌سازی کلاس انجام نشد." }, { status: 500 });
  }
}
