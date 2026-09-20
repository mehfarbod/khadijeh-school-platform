import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createStaffSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "نام الزامی است.")
    .max(100, "نام بیش از حد طولانی است."),

  lastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی الزامی است.")
    .max(100, "نام خانوادگی بیش از حد طولانی است."),

  position: z
    .string()
    .trim()
    .min(1, "سمت الزامی است.")
    .max(100, "سمت بیش از حد طولانی است."),

  subject: z
    .string()
    .trim()
    .max(150, "نام درس بیش از حد طولانی است.")
    .nullable()
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "دسته‌بندی الزامی است.")
    .max(100, "دسته‌بندی بیش از حد طولانی است."),

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const staff = await prisma.staff.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [
        { category: "asc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET /api/staff error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات کادر مدرسه" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();

    const result = createStaffSchema.safeParse(body);

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

    const staff = await prisma.staff.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        subject: data.subject || null,
        category: data.category,
        bio: data.bio || null,
        education: data.education || null,
        photo: data.photo || null,
        phone: data.phone || null,
        email: data.email || null,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff error:", error);

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
      { error: "خطا در ایجاد عضو کادر" },
      { status: 500 }
    );
  }
}