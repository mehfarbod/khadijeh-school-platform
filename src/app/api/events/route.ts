import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const createEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان رویداد الزامی است.")
    .max(200, "عنوان رویداد بیش از حد طولانی است."),

  slug: z
    .string()
    .trim()
    .min(1, "شناسه رویداد الزامی است.")
    .max(200, "شناسه رویداد بیش از حد طولانی است."),

  description: z
    .string()
    .trim()
    .min(1, "توضیحات رویداد الزامی است.")
    .max(10000, "توضیحات رویداد بیش از حد طولانی است."),

  date: z
    .string()
    .trim()
    .min(1, "تاریخ رویداد الزامی است."),

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
    .min(1, "نوع رویداد الزامی است.")
    .max(100, "نوع رویداد نامعتبر است."),

  coverImage: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const events = await prisma.event.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت رویدادها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("events.manage");

    const body = await request.json();
    const result = createEventSchema.safeParse(body);

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

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        date: data.date,
        time: data.time || null,
        location: data.location || null,
        eventType: data.eventType,
        coverImage: data.coverImage || null,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);

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
      { error: "خطا در ایجاد رویداد" },
      { status: 500 }
    );
  }
}