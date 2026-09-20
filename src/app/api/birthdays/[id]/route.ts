import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateBirthdaySchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(1, "شناسه دانش‌آموز نمی‌تواند خالی باشد.")
    .nullable()
    .optional(),

  firstName: z
    .string()
    .trim()
    .min(1, "نام نمی‌تواند خالی باشد.")
    .max(100, "نام بیش از حد طولانی است.")
    .optional(),

  grade: z
    .string()
    .trim()
    .min(1, "پایه تحصیلی نمی‌تواند خالی باشد.")
    .max(50, "پایه تحصیلی نامعتبر است.")
    .optional(),

  birthday: z
    .string()
    .trim()
    .min(1, "تاریخ تولد نمی‌تواند خالی باشد.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "تاریخ تولد نامعتبر است."
    )
    .optional(),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isVisible: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;
    const body = await request.json();

    const result = updateBirthdaySchema.safeParse(body);

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

    const birthday = await prisma.birthday.update({
      where: { id },
      data: {
        ...(data.studentId !== undefined && {
          studentId: data.studentId || null,
        }),
        ...(data.firstName !== undefined && {
          firstName: data.firstName,
        }),
        ...(data.grade !== undefined && {
          grade: data.grade,
        }),
        ...(data.birthday !== undefined && {
          birthday: data.birthday,
        }),
        ...(data.photo !== undefined && {
          photo: data.photo || null,
        }),
        ...(data.isVisible !== undefined && {
          isVisible: data.isVisible,
        }),
      },
    });

    return NextResponse.json(birthday);
  } catch (error) {
    console.error("PATCH /api/birthdays/[id] error:", error);

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
      { error: "خطا در ویرایش تولد" },
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

    await prisma.birthday.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/birthdays/[id] error:", error);

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
      { error: "خطا در حذف تولد" },
      { status: 500 }
    );
  }
}