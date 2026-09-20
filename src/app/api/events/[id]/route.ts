import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان رویداد نمی‌تواند خالی باشد.")
    .max(200, "عنوان رویداد بیش از حد طولانی است.")
    .optional(),

  slug: z
    .string()
    .trim()
    .min(1, "شناسه رویداد نمی‌تواند خالی باشد.")
    .max(200, "شناسه رویداد بیش از حد طولانی است.")
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, "توضیحات رویداد نمی‌تواند خالی باشد.")
    .max(10000, "توضیحات رویداد بیش از حد طولانی است.")
    .optional(),

  date: z
    .string()
    .trim()
    .min(1, "تاریخ رویداد نمی‌تواند خالی باشد.")
    .optional(),

  time: z
    .string()
    .trim()
    .max(50, "زمان رویداد نامعتبر است.")
    .nullable()
    .optional(),

  location: z
    .string()
    .trim()
    .max(300, "مکان رویداد بیش از حد طولانی است.")
    .nullable()
    .optional(),

  eventType: z
    .string()
    .trim()
    .min(1, "نوع رویداد نمی‌تواند خالی باشد.")
    .max(100, "نوع رویداد نامعتبر است.")
    .optional(),

  coverImage: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
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

    const result = updateEventSchema.safeParse(body);

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

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.slug !== undefined && {
          slug: data.slug,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.date !== undefined && {
          date: data.date,
        }),
        ...(data.time !== undefined && {
          time: data.time || null,
        }),
        ...(data.location !== undefined && {
          location: data.location || null,
        }),
        ...(data.eventType !== undefined && {
          eventType: data.eventType,
        }),
        ...(data.coverImage !== undefined && {
          coverImage: data.coverImage || null,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);

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
      { error: "خطا در ویرایش رویداد" },
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

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);

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
      { error: "خطا در حذف رویداد" },
      { status: 500 }
    );
  }
}