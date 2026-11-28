import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

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

  className: z.string().trim().min(1, "نام کلاس الزامی است.").max(100),
  rank: z.number().int().min(1).max(3),

  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const activeOnly = searchParams.get("activeOnly") !== "false";

    if (!activeOnly) await requirePermission("top_students.manage");

    const students = await prisma.topStudent.findMany({
      where: activeOnly ? { isActive: true, className: { not: null }, rank: { in: [1, 2, 3] } } : undefined,
      orderBy: [
        { academicYear: "desc" },
        { className: "asc" },
        { rank: "asc" },
      ],
      select: activeOnly
        ? { id: true, firstName: true, lastName: true, grade: true, achievement: true, academicYear: true, className: true, rank: true }
        : undefined,
    });

    return NextResponse.json(students);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت دانش‌آموزان برتر را ندارید." }, { status: 403 });
    }

    return NextResponse.json(
      { error: "خطا در دریافت دانش‌آموزان برتر" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("top_students.manage");

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

    const schoolClass = await prisma.class.findFirst({
      where: {
        name: data.className,
        grade: data.grade,
        isActive: true,
        academicYear: { isCurrent: true, title: data.academicYear },
      },
      select: { id: true },
    });
    if (!schoolClass) {
      return NextResponse.json(
        { error: "کلاس انتخاب‌شده برای پایه و سال تحصیلی جاری معتبر نیست." },
        { status: 400 }
      );
    }

    const occupied = await prisma.topStudent.findFirst({
      where: { academicYear: data.academicYear, className: data.className, rank: data.rank, isActive: true },
      select: { id: true },
    });
    if (occupied) return NextResponse.json({ error: "این رتبه برای کلاس و سال تحصیلی انتخاب‌شده قبلاً ثبت شده است." }, { status: 409 });

    const student = await prisma.topStudent.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        grade: data.grade,
        achievement: data.achievement,
        academicYear: data.academicYear,
        category: data.category || null,
        className: data.className,
        rank: data.rank,
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
