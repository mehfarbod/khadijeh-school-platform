import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createTopStudentSchema = z.object({
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

  grade: z
    .string()
    .trim()
    .min(1, "پایه تحصیلی الزامی است.")
    .max(50, "پایه تحصیلی نامعتبر است."),

  achievement: z
    .string()
    .trim()
    .min(1, "دستاورد الزامی است.")
    .max(500, "توضیح دستاورد بیش از حد طولانی است."),

  academicYear: z
    .string()
    .trim()
    .min(1, "سال تحصیلی الزامی است.")
    .max(20, "سال تحصیلی نامعتبر است."),

  category: z
    .string()
    .trim()
    .max(100, "دسته‌بندی بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const activeOnly = searchParams.get("activeOnly") !== "false";

    const students = await prisma.topStudent.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { academicYear: "desc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/top-students error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت دانش‌آموزان برتر" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();

    const result = createTopStudentSchema.safeParse(body);

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

    const student = await prisma.topStudent.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        grade: data.grade,
        achievement: data.achievement,
        academicYear: data.academicYear,
        category: data.category || null,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/top-students error:", error);

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
      { error: "خطا در ایجاد دانش‌آموز برتر" },
      { status: 500 }
    );
  }
}