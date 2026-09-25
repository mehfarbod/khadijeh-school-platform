import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";

import { requireRole } from "@/lib/auth/authorization";

import {
  isValidJalaliDate,
  jalaliToGregorian,
  normalizeDigits,
} from "@/lib/date/jalali";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const iranianMobileSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, "شماره تلفن همراه نامعتبر است.");
const iranianNationalIdSchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .pipe(z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد."));
const updateStudentSchema = z.object({
  // Student information
  firstName: z
    .string()
    .trim()
    .min(1, "نام نمی‌تواند خالی باشد.")
    .max(100, "نام بیش از حد طولانی است.")
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی نمی‌تواند خالی باشد.")
    .max(100, "نام خانوادگی بیش از حد طولانی است.")
    .optional(),

  nationalId: iranianNationalIdSchema.nullable().optional(),

  birthCertificateSerial: z
    .string()
    .trim()
    .max(100, "شماره سری شناسنامه بیش از حد طولانی است.")
    .nullable()
    .optional(),

  mobile: iranianMobileSchema.nullable().optional(),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  birthday: z
    .string()
    .trim()
    .transform(normalizeDigits)
    .nullable()
    .optional()
    .refine(
      (value) =>
        !value ||
        (/^\d{4}\/\d{2}\/\d{2}$/.test(value) && isValidJalaliDate(value)),
      "تاریخ تولد نامعتبر است.",
    ),

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

  fatherNationalId: iranianNationalIdSchema.nullable().optional(),

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

  fatherMobile: iranianMobileSchema.nullable().optional(),

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

  motherNationalId: iranianNationalIdSchema.nullable().optional(),

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

  motherMobile: iranianMobileSchema.nullable().optional(),

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

  // Legacy guardian fields
  guardianName: z
    .string()
    .trim()
    .max(150, "نام ولی بیش از حد طولانی است.")
    .nullable()
    .optional(),

  guardianPhone: iranianMobileSchema.nullable().optional(),

  // Optional future field
  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است.")
    .max(255, "ایمیل بیش از حد طولانی است.")
    .nullable()
    .optional(),

  // Enrollment information
  academicYearId: z.string().trim().min(1, "سال تحصیلی الزامی است.").optional(),

  grade: z
    .string()
    .trim()
    .min(1, "پایه تحصیلی نمی‌تواند خالی باشد.")
    .max(50, "پایه تحصیلی نامعتبر است.")
    .optional(),

  className: z
    .string()
    .trim()
    .max(50, "نام کلاس بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;

    const body = await request.json();

    const result = updateStudentSchema.safeParse(body);

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

    const existingStudent = await prisma.student.findUnique({
      where: {
        id,
      },

      include: {
        enrollments: {
          orderBy: {
            academicYear: {
              title: "desc",
            },
          },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        {
          error: "دانش‌آموز موردنظر یافت نشد.",
        },
        {
          status: 404,
        },
      );
    }

    if (data.academicYearId) {
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
    }

    /**
     * Convert Jalali birthday to Gregorian
     * only when birthday is actually supplied.
     */
    const birthday =
      data.birthday !== undefined
        ? data.birthday
          ? new Date(jalaliToGregorian(data.birthday))
          : null
        : undefined;

    const student = await prisma.$transaction(async (tx) => {
      const updatedStudent = await tx.student.update({
        where: {
          id,
        },

        data: {
          // Student information
          ...(data.firstName !== undefined && {
            firstName: data.firstName,
          }),

          ...(data.lastName !== undefined && {
            lastName: data.lastName,
          }),

          ...(data.nationalId !== undefined && {
            nationalId: data.nationalId || null,
          }),

          ...(data.birthCertificateSerial !== undefined && {
            birthCertificateSerial: data.birthCertificateSerial || null,
          }),

          ...(data.mobile !== undefined && {
            mobile: data.mobile || null,
          }),

          ...(data.photo !== undefined && {
            photo: data.photo || null,
          }),

          ...(birthday !== undefined && {
            birthday,
          }),

          // Father information
          ...(data.fatherFirstName !== undefined && {
            fatherFirstName: data.fatherFirstName || null,
          }),

          ...(data.fatherLastName !== undefined && {
            fatherLastName: data.fatherLastName || null,
          }),

          ...(data.fatherNationalId !== undefined && {
            fatherNationalId: data.fatherNationalId || null,
          }),

          ...(data.fatherJob !== undefined && {
            fatherJob: data.fatherJob || null,
          }),

          ...(data.fatherEducation !== undefined && {
            fatherEducation: data.fatherEducation || null,
          }),

          ...(data.fatherMobile !== undefined && {
            fatherMobile: data.fatherMobile || null,
          }),

          // Mother information
          ...(data.motherFirstName !== undefined && {
            motherFirstName: data.motherFirstName || null,
          }),

          ...(data.motherLastName !== undefined && {
            motherLastName: data.motherLastName || null,
          }),

          ...(data.motherNationalId !== undefined && {
            motherNationalId: data.motherNationalId || null,
          }),

          ...(data.motherJob !== undefined && {
            motherJob: data.motherJob || null,
          }),

          ...(data.motherEducation !== undefined && {
            motherEducation: data.motherEducation || null,
          }),

          ...(data.motherMobile !== undefined && {
            motherMobile: data.motherMobile || null,
          }),

          // Contact information
          ...(data.address !== undefined && {
            address: data.address || null,
          }),

          ...(data.landline !== undefined && {
            landline: data.landline || null,
          }),

          ...(data.description !== undefined && {
            description: data.description || null,
          }),

          // Legacy guardian fields
          ...(data.guardianName !== undefined && {
            guardianName: data.guardianName || null,
          }),

          ...(data.guardianPhone !== undefined && {
            guardianPhone: data.guardianPhone || null,
          }),

          ...(data.email !== undefined && {
            email: data.email || null,
          }),

          ...(data.isActive !== undefined && {
            isActive: data.isActive,
          }),
        },
      });

      const enrollmentChanged =
        data.academicYearId !== undefined ||
        data.grade !== undefined ||
        data.className !== undefined;

      if (enrollmentChanged) {
        const enrollment = data.academicYearId
          ? await tx.studentEnrollment.upsert({
              where: {
                studentId_academicYearId: {
                  studentId: id,
                  academicYearId: data.academicYearId,
                },
              },

              update: {
                ...(data.grade !== undefined && {
                  grade: data.grade,
                }),

                ...(data.className !== undefined && {
                  className: data.className || null,
                }),
              },

              create: {
                studentId: id,

                academicYearId: data.academicYearId,

                grade:
                  data.grade ??
                  existingStudent.enrollments[0]?.grade ??
                  "نامشخص",

                className: data.className || null,
              },
            })
          : existingStudent.enrollments[0]
            ? await tx.studentEnrollment.update({
                where: {
                  id: existingStudent.enrollments[0].id,
                },

                data: {
                  ...(data.grade !== undefined && {
                    grade: data.grade,
                  }),

                  ...(data.className !== undefined && {
                    className: data.className || null,
                  }),
                },
              })
            : null;

        if (!enrollment) {
          throw new Error("STUDENT_ENROLLMENT_NOT_FOUND");
        }
      }

      return tx.student.findUnique({
        where: {
          id,
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
      });
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PATCH /api/students/[id] error:", error);

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
      error instanceof Error &&
      error.message === "STUDENT_ENROLLMENT_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error: "سابقه تحصیلی این دانش‌آموز پیدا نشد.",
        },
        {
          status: 400,
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

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          error: "اطلاعات موردنظر پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        error: "خطا در ویرایش اطلاعات دانش‌آموز",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;

    const student = await prisma.student.findUnique({
      where: {
        id,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          error: "دانش‌آموز موردنظر یافت نشد.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.student.update({
      where: {
        id,
      },

      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);

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

    return NextResponse.json(
      {
        error: "خطا در غیرفعال‌سازی دانش‌آموز",
      },
      {
        status: 500,
      },
    );
  }
}
