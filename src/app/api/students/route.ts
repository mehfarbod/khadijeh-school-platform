import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createStudentSchema = z.object({
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

  nationalId: z
    .string()
    .trim()
    .max(20, "کد ملی نامعتبر است.")
    .optional()
    .nullable(),

  mobile: z
    .string()
    .trim()
    .max(30, "شماره تلفن همراه نامعتبر است.")
    .optional()
    .nullable(),

  grade: z
    .string()
    .trim()
    .min(1, "پایه تحصیلی الزامی است.")
    .max(50, "پایه تحصیلی نامعتبر است."),

  className: z
    .string()
    .trim()
    .max(50, "نام کلاس بیش از حد طولانی است.")
    .optional()
    .nullable(),

  academicYear: z
    .string()
    .trim()
    .min(1, "سال تحصیلی الزامی است.")
    .max(20, "سال تحصیلی نامعتبر است."),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .optional()
    .nullable(),

  birthday: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "تاریخ تولد نامعتبر است.",
    ),

  guardianName: z
    .string()
    .trim()
    .max(150, "نام ولی بیش از حد طولانی است.")
    .optional()
    .nullable(),

  guardianPhone: z
    .string()
    .trim()
    .max(30, "شماره تماس نامعتبر است.")
    .optional()
    .nullable(),

  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است.")
    .max(255, "ایمیل بیش از حد طولانی است.")
    .optional()
    .nullable(),

  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const grade = searchParams.get("grade");
    const academicYear = searchParams.get("academicYear");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const students = await prisma.student.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(grade || academicYear
          ? {
              enrollments: {
                some: {
                  ...(grade ? { grade } : {}),
                  ...(academicYear
                    ? {
                        academicYear: {
                          title: academicYear,
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
      },
      include: {
        enrollments: {
          include: {
            academicYear: true,
          },
          orderBy: {
            academicYear: {
              title: "desc",
            },
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات دانش‌آموزان" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();
    const result = createStudentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "اطلاعات واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = result.data;

    const student = await prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId || null,
        mobile: data.mobile || null,
        photo: data.photo || null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        email: data.email || null,
        isActive: data.isActive ?? true,

        enrollments: {
          create: {
            grade: data.grade,
            className: data.className || null,

            academicYear: {
              connectOrCreate: {
                where: {
                  title: data.academicYear,
                },
                create: {
                  title: data.academicYear,
                },
              },
            },
          },
        },
      },
      include: {
        enrollments: {
          include: {
            academicYear: true,
          },
        },
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز انجام این عملیات را ندارید." },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد دانش‌آموز" },
      { status: 500 },
    );
  }
}
