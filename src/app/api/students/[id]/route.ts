import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateStudentSchema = z.object({
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

  className: z
    .string()
    .trim()
    .min(1, "کلاس نمی‌تواند خالی باشد.")
    .max(50, "نام کلاس بیش از حد طولانی است.")
    .optional(),

  academicYear: z
    .string()
    .trim()
    .min(1, "سال تحصیلی نمی‌تواند خالی باشد.")
    .max(20, "سال تحصیلی نامعتبر است.")
    .optional(),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  birthday: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "تاریخ تولد نامعتبر است."
    ),

  guardianName: z
    .string()
    .trim()
    .max(150, "نام ولی بیش از حد طولانی است.")
    .nullable()
    .optional(),

  guardianPhone: z
    .string()
    .trim()
    .max(30, "شماره تماس نامعتبر است.")
    .nullable()
    .optional(),

  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است.")
    .max(255, "ایمیل بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;
    const body = await request.json();

    const result = updateStudentSchema.safeParse(body);

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

    const student = await prisma.student.update({
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
        ...(data.className !== undefined && {
          className: data.className,
        }),
        ...(data.academicYear !== undefined && {
          academicYear: data.academicYear,
        }),
        ...(data.photo !== undefined && {
          photo: data.photo || null,
        }),
        ...(data.birthday !== undefined && {
          birthday: data.birthday
            ? new Date(data.birthday)
            : null,
        }),
        ...(data.guardianName !== undefined && {
          guardianName: data.guardianName || null,
        }),
        ...(data.guardianPhone !== undefined && {
          guardianPhone: data.guardianPhone || null,
        }),
        ...(data.email !== undefined && {
          email: data.email || null,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PATCH /api/students/[id] error:", error);

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
      { error: "خطا در ویرایش اطلاعات دانش‌آموز" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);

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
      { error: "خطا در حذف دانش‌آموز" },
      { status: 500 }
    );
  }
}