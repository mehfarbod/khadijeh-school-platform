import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateStaffSchema = z.object({
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

  position: z
    .string()
    .trim()
    .min(1, "سمت نمی‌تواند خالی باشد.")
    .max(100, "سمت بیش از حد طولانی است.")
    .optional(),

  subject: z
    .string()
    .trim()
    .max(150, "نام درس بیش از حد طولانی است.")
    .nullable()
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "دسته‌بندی نمی‌تواند خالی باشد.")
    .max(100, "دسته‌بندی بیش از حد طولانی است.")
    .optional(),

  bio: z
    .string()
    .trim()
    .max(3000, "شرح سوابق بیش از حد طولانی است.")
    .nullable()
    .optional(),

  education: z
    .string()
    .trim()
    .max(500, "مدرک تحصیلی بیش از حد طولانی است.")
    .nullable()
    .optional(),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  phone: z
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

    const result = updateStaffSchema.safeParse(body);

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

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && {
          firstName: data.firstName,
        }),
        ...(data.lastName !== undefined && {
          lastName: data.lastName,
        }),
        ...(data.position !== undefined && {
          position: data.position,
        }),
        ...(data.subject !== undefined && {
          subject: data.subject || null,
        }),
        ...(data.category !== undefined && {
          category: data.category,
        }),
        ...(data.bio !== undefined && {
          bio: data.bio || null,
        }),
        ...(data.education !== undefined && {
          education: data.education || null,
        }),
        ...(data.photo !== undefined && {
          photo: data.photo || null,
        }),
        ...(data.phone !== undefined && {
          phone: data.phone || null,
        }),
        ...(data.email !== undefined && {
          email: data.email || null,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("PATCH /api/staff/[id] error:", error);

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
      { error: "خطا در ویرایش اطلاعات کادر" },
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

    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/staff/[id] error:", error);

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
      { error: "خطا در حذف عضو کادر" },
      { status: 500 }
    );
  }
}