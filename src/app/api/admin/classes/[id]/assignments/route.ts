import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission, requireRole } from "@/lib/auth/authorization";

const assignmentSchema = z.object({
  teacherId: z.string().trim().min(1, "معلم الزامی است."),
  subject: z.string().trim().max(100).optional().nullable(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.edit");

    const { id: classId } = await context.params;
    const parsed = assignmentSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "اطلاعات اختصاص معلم معتبر نیست.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, isActive: true },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "کلاس موردنظر یافت نشد." }, { status: 404 });
    }

    if (!classRecord.isActive) {
      return NextResponse.json({ error: "کلاس غیرفعال است." }, { status: 400 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: parsed.data.teacherId },
      select: {
        id: true,
        role: true,
        isActive: true,
        staff: {
          select: { id: true, firstName: true, lastName: true, subject: true, isActive: true },
        },
      },
    });

    if (!teacher || teacher.role !== "TEACHER" || !teacher.isActive || !teacher.staff?.isActive) {
      return NextResponse.json(
        { error: "کاربر انتخاب‌شده یک معلم فعال نیست." },
        { status: 400 },
      );
    }

    const subject = parsed.data.subject?.trim() || null;

    const duplicate = await prisma.teacherClassAssignment.findFirst({
      where: { classId, teacherId: teacher.id, subject },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "این معلم قبلاً با همین درس به این کلاس اختصاص داده شده است." },
        { status: 409 },
      );
    }

    try {
      const assignment = await prisma.teacherClassAssignment.create({
        data: {
          classId,
          teacherId: teacher.id,
          subject,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              staff: {
                select: { firstName: true, lastName: true, subject: true },
              },
            },
          },
          class: {
            select: { id: true, grade: true, name: true, academicYearId: true },
          },
        },
      });

      return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "این معلم قبلاً با همین درس به این کلاس اختصاص داده شده است." },
          { status: 409 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("POST /api/admin/classes/[id]/assignments error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز اختصاص معلم را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "اختصاص معلم انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.edit");

    const { id: classId } = await context.params;
    const assignmentId = new URL(request.url).searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "شناسه اختصاص معلم الزامی است." }, { status: 400 });
    }

    const assignment = await prisma.teacherClassAssignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, classId: true },
    });

    if (!assignment || assignment.classId !== classId) {
      return NextResponse.json({ error: "اختصاص معلم موردنظر یافت نشد." }, { status: 404 });
    }

    await prisma.teacherClassAssignment.delete({ where: { id: assignmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/classes/[id]/assignments error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز حذف اختصاص معلم را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "حذف اختصاص معلم انجام نشد." }, { status: 500 });
  }
}
