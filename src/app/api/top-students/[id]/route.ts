import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateTopStudentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "نام نمی‌تواند خالی باشد.")
    .max(100, "نام بیش از حد طولانی است.")
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی نمی‌تواند خالی باشد.")
    .max(100, "نام خانوادگی بیش از حد طولانی است.")
    .optional(),

  grade: z
    .string()
    .trim()
    .min(1, "پایه تحصیلی نمی‌تواند خالی باشد.")
    .max(50, "پایه تحصیلی نامعتبر است.")
    .optional(),

  achievement: z
    .string()
    .trim()
    .min(1, "دستاورد نمی‌تواند خالی باشد.")
    .max(500, "توضیح دستاورد بیش از حد طولانی است.")
    .optional(),

  academicYear: z
    .string()
    .trim()
    .min(1, "سال تحصیلی نمی‌تواند خالی باشد.")
    .max(20, "سال تحصیلی نامعتبر است.")
    .optional(),

  category: z
    .string()
    .trim()
    .max(100, "دسته‌بندی بیش از حد طولانی است.")
    .nullable()
    .optional(),

  className: z.string().trim().min(1).max(100).nullable().optional(),
  rank: z.number().int().min(1).max(3).nullable().optional(),

  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requirePermission("top_students.manage");

    const { id } = await context.params;
    const body = await request.json();

    const result = updateTopStudentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "اطلاعات واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    const existing = await prisma.topStudent.findUnique({ where: { id }, select: { academicYear: true, className: true, rank: true } });
    if (!existing) return NextResponse.json({ error: "رکورد موردنظر یافت نشد." }, { status: 404 });
    const nextAcademicYear = data.academicYear ?? existing.academicYear;
    const nextClassName = data.className === undefined ? existing.className : data.className;
    const nextRank = data.rank === undefined ? existing.rank : data.rank;
    if (nextClassName && nextRank) {
      const occupied = await prisma.topStudent.findFirst({ where: { id: { not: id }, academicYear: nextAcademicYear, className: nextClassName, rank: nextRank, isActive: true }, select: { id: true } });
      if (occupied) return NextResponse.json({ error: "این رتبه برای کلاس و سال تحصیلی انتخاب‌شده قبلاً ثبت شده است." }, { status: 409 });
    }

    const student = await prisma.topStudent.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && {
          firstName: data.firstName,
        }),
        ...(data.lastName !== undefined && {
          lastName: data.lastName,
        }),
        ...(data.grade !== undefined && {
          grade: data.grade,
        }),
        ...(data.achievement !== undefined && {
          achievement: data.achievement,
        }),
        ...(data.academicYear !== undefined && {
          academicYear: data.academicYear,
        }),
        ...(data.category !== undefined && {
          category: data.category || null,
        }),
        ...(data.className !== undefined && { className: data.className || null }),
        ...(data.rank !== undefined && { rank: data.rank }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PATCH /api/top-students/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز انجام این عملیات را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ویرایش دانش‌آموز برتر" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requirePermission("top_students.manage");

    const { id } = await context.params;

    await prisma.topStudent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/top-students/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز انجام این عملیات را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در حذف دانش‌آموز برتر" },
      { status: 500 }
    );
  }
}
