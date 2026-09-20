import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createBirthdaySchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(1, "شناسه دانش‌آموز نمی‌تواند خالی باشد.")
    .nullable()
    .optional(),

  firstName: z
    .string()
    .trim()
    .min(1, "نام الزامی است.")
    .max(100, "نام بیش از حد طولانی است."),

  grade: z
    .string()
    .trim()
    .min(1, "پایه تحصیلی الزامی است.")
    .max(50, "پایه تحصیلی نامعتبر است."),

  birthday: z
    .string()
    .trim()
    .min(1, "تاریخ تولد الزامی است.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "تاریخ تولد نامعتبر است."
    ),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isVisible: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const birthdays = await prisma.birthday.findMany({
      where: activeOnly ? { isVisible: true } : undefined,
      orderBy: {
        birthday: "asc",
      },
    });

    return NextResponse.json(birthdays);
  } catch (error) {
    console.error("GET /api/birthdays error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت تولدها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();

    const result = createBirthdaySchema.safeParse(body);

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
const birthday = await prisma.birthday.create({
  data: {
    studentId: data.studentId || null,
    firstName: data.firstName,
    grade: data.grade,
    birthday: data.birthday,
    photo: data.photo || null,
    isVisible: data.isVisible ?? true,
  },
});

    return NextResponse.json(birthday, { status: 201 });
  } catch (error) {
    console.error("POST /api/birthdays error:", error);

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
      { error: "خطا در ایجاد تولد" },
      { status: 500 }
    );
  }
}