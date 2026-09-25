import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان اطلاعیه نمی‌تواند خالی باشد.")
    .max(200, "عنوان اطلاعیه بیش از حد طولانی است.")
    .optional(),

  content: z
    .string()
    .trim()
    .min(1, "متن اطلاعیه نمی‌تواند خالی باشد.")
    .max(10000, "متن اطلاعیه بیش از حد طولانی است.")
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "دسته‌بندی اطلاعیه نمی‌تواند خالی باشد.")
    .max(100, "دسته‌بندی اطلاعیه نامعتبر است.")
    .optional(),

  isPinned: z.boolean().optional(),

  isActive: z.boolean().optional(),

  expiresAt: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "تاریخ انقضا نامعتبر است."
    ),
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requirePermission("announcements.manage");

    const { id } = await context.params;
    const body = await request.json();

    const result = updateAnnouncementSchema.safeParse(body);

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

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.content !== undefined && {
          content: data.content,
        }),
        ...(data.category !== undefined && {
          category: data.category,
        }),
        ...(data.isPinned !== undefined && {
          isPinned: data.isPinned,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt || null,
        }),
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("PATCH /api/announcements/[id] error:", error);

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
      { error: "خطا در ویرایش اطلاعیه" },
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

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/announcements/[id] error:", error);

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
      { error: "خطا در حذف اطلاعیه" },
      { status: 500 }
    );
  }
}