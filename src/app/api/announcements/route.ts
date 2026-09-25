import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان اطلاعیه الزامی است.")
    .max(200, "عنوان اطلاعیه بیش از حد طولانی است."),

  content: z
    .string()
    .trim()
    .min(1, "متن اطلاعیه الزامی است.")
    .max(10000, "متن اطلاعیه بیش از حد طولانی است."),

  category: z
    .string()
    .trim()
    .min(1, "دسته‌بندی اطلاعیه الزامی است.")
    .max(100, "دسته‌بندی اطلاعیه نامعتبر است."),

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const announcements = await prisma.announcement.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    const visibleAnnouncements = activeOnly
      ? announcements.filter(
          (item) =>
            !item.expiresAt ||
            Number.isNaN(new Date(item.expiresAt).getTime()) ||
            new Date(item.expiresAt).getTime() > Date.now(),
        )
      : announcements;

    return NextResponse.json(visibleAnnouncements);
  } catch (error) {
    console.error("GET /api/announcements error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعیه‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("announcements.manage");

    const body = await request.json();
    const result = createAnnouncementSchema.safeParse(body);

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

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        isPinned: data.isPinned ?? false,
        isActive: data.isActive ?? true,
       expiresAt: data.expiresAt || null,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);

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
      { error: "خطا در ایجاد اطلاعیه" },
      { status: 500 }
    );
  }
}