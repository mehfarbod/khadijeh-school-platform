import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { jalaliToGregorian } from "@/lib/date/jalali";
import {
  gradeSchema,
  iranianMobileSchema,
  iranianNationalIdSchema,
  optionalJalaliBirthdaySchema,
  optionalMobileSchema,
  optionalNationalIdSchema,
} from "@/lib/validation/student";

const studentSchema = z.object({
  // Student information
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

  nationalId: optionalNationalIdSchema,

  birthCertificateSerial: z
    .string()
    .trim()
    .max(100, "شماره سری شناسنامه بیش از حد طولانی است.")
    .nullable()
    .optional(),

  mobile: optionalMobileSchema,

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  birthday: optionalJalaliBirthdaySchema,

  // Father information
  fatherFirstName: z
    .string()
    .trim()
    .max(100, "نام پدر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  fatherLastName: z
    .string()
    .trim()
    .max(100, "نام خانوادگی پدر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  fatherNationalId: optionalNationalIdSchema,

  fatherJob: z
    .string()
    .trim()
    .max(150, "شغل پدر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  fatherEducation: z
    .string()
    .trim()
    .max(150, "تحصیلات پدر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  fatherMobile: optionalMobileSchema,

  // Mother information
  motherFirstName: z
    .string()
    .trim()
    .max(100, "نام مادر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  motherLastName: z
    .string()
    .trim()
    .max(100, "نام خانوادگی مادر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  motherNationalId: optionalNationalIdSchema,

  motherJob: z
    .string()
    .trim()
    .max(150, "شغل مادر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  motherEducation: z
    .string()
    .trim()
    .max(150, "تحصیلات مادر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  motherMobile: optionalMobileSchema,

  // Contact information
  address: z
    .string()
    .trim()
    .max(1000, "آدرس بیش از حد طولانی است.")
    .nullable()
    .optional(),

  landline: z
    .string()
    .trim()
    .max(30, "شماره تلفن ثابت بیش از حد طولانی است.")
    .nullable()
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "توضیحات بیش از حد طولانی است.")
    .nullable()
    .optional(),

  // Enrollment information
  academicYearId: z.string().trim().min(1, "سال تحصیلی الزامی است."),

  grade: gradeSchema,

  className: z
    .string()
    .trim()
    .max(50, "نام کلاس بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const academicYearId = searchParams.get("academicYearId");
    const grade = searchParams.get("grade");
    const className = searchParams.get("className");

    const activeOnly = searchParams.get("activeOnly") !== "false";

    const hasEnrollmentFilter = !!academicYearId || !!grade || !!className;

    const enrollmentWhere = {
      ...(academicYearId ? { academicYearId } : {}),
      ...(grade ? { grade } : {}),
      ...(className ? { className } : {}),
    };

    const students = await prisma.student.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),

        ...(hasEnrollmentFilter
          ? {
              enrollments: {
                some: enrollmentWhere,
              },
            }
          : {}),
      },

      include: {
        enrollments: {
          where: hasEnrollmentFilter ? enrollmentWhere : undefined,

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

      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
      ],
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);

    return NextResponse.json(
      {
        error: "خطا در دریافت اطلاعات دانش‌آموزان",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();

    const result = studentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "اطلاعات واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const data = result.data;

    const academicYear = await prisma.academicYear.findUnique({
      where: {
        id: data.academicYearId,
      },
    });

    if (!academicYear) {
      return NextResponse.json(
        {
          error: "سال تحصیلی انتخاب‌شده یافت نشد.",
        },
        {
          status: 400,
        },
      );
    }

    const birthday = data.birthday
      ? new Date(jalaliToGregorian(data.birthday))
      : null;

    const student = await prisma.student.create({
      data: {
        // Student information
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId || null,
        birthCertificateSerial: data.birthCertificateSerial || null,
        mobile: data.mobile || null,
        photo: data.photo || null,
        birthday,
        isBirthdayVisible: true,

        // Father information
        fatherFirstName: data.fatherFirstName || null,
        fatherLastName: data.fatherLastName || null,
        fatherNationalId: data.fatherNationalId || null,
        fatherJob: data.fatherJob || null,
        fatherEducation: data.fatherEducation || null,
        fatherMobile: data.fatherMobile || null,

        // Mother information
        motherFirstName: data.motherFirstName || null,
        motherLastName: data.motherLastName || null,
        motherNationalId: data.motherNationalId || null,
        motherJob: data.motherJob || null,
        motherEducation: data.motherEducation || null,
        motherMobile: data.motherMobile || null,

        // Contact information
        address: data.address || null,
        landline: data.landline || null,
        description: data.description || null,

        // Management
        isActive: data.isActive ?? true,

        // Enrollment
        enrollments: {
          create: {
            academicYearId: data.academicYearId,
            grade: data.grade,
            className: data.className || null,
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

    return NextResponse.json(student, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/students error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          error: "احراز هویت الزامی است.",
        },
        {
          status: 401,
        },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          error: "شما مجوز انجام این عملیات را ندارید.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "دانش‌آموزی با این کد ملی قبلاً در سیستم ثبت شده است.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error: "خطا در ایجاد دانش‌آموز",
      },
      {
        status: 500,
      },
    );
  }
}
