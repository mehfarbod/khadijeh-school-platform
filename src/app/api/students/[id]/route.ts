import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { jalaliToGregorian } from "@/lib/date/jalali";
import {
  studentProfileSchema,
  studentEnrollmentSchema,
} from "@/lib/validation/student";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateStudentSchema = studentProfileSchema
  .partial()
  .merge(studentEnrollmentSchema.partial())
  .extend({
    photo: z
      .string()
      .trim()
      .max(2000, "آدرس تصویر بیش از حد طولانی است.")
      .nullable()
      .optional(),

    isActive: z.boolean().optional(),
    isBirthdayVisible: z.boolean().optional(),
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

    /*
     * Validate academic year when it is being changed.
     */
    if (data.academicYearId !== undefined) {
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

    /*
     * Convert Jalali birthday to Gregorian DateTime.
     *
     * undefined = do not change
     * empty/null = remove birthday
     * valid value = update birthday
     */
    const birthday =
      data.birthday !== undefined
        ? data.birthday
          ? new Date(jalaliToGregorian(data.birthday))
          : null
        : undefined;

    const student = await prisma.$transaction(async (tx) => {
      /*
       * Update student profile.
       */
      await tx.student.update({
        where: {
          id,
        },

        data: {
          // Student
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

          // Father
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

          // Mother
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

          // Contact
          ...(data.address !== undefined && {
            address: data.address || null,
          }),

          ...(data.landline !== undefined && {
            landline: data.landline || null,
          }),

          ...(data.description !== undefined && {
            description: data.description || null,
          }),

          // Status
          ...(data.isActive !== undefined && {
            isActive: data.isActive,
          }),

          ...(data.isBirthdayVisible !== undefined && {
            isBirthdayVisible: data.isBirthdayVisible,
          }),
        },
      });

      /*
       * Enrollment
       *
       * If any enrollment field changes:
       * - use the requested academic year when provided
       * - otherwise use the student's latest enrollment
       */
      const enrollmentChanged =
        data.academicYearId !== undefined ||
        data.grade !== undefined ||
        data.className !== undefined;

      if (enrollmentChanged) {
        const academicYearId =
          data.academicYearId ?? existingStudent.enrollments[0]?.academicYearId;

        if (!academicYearId) {
          throw new Error("STUDENT_ENROLLMENT_NOT_FOUND");
        }

        const existingEnrollment = existingStudent.enrollments.find(
          (enrollment) => enrollment.academicYearId === academicYearId,
        );

        await tx.studentEnrollment.upsert({
          where: {
            studentId_academicYearId: {
              studentId: id,
              academicYearId,
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
            academicYearId,

            grade:
              data.grade ??
              existingEnrollment?.grade ??
              existingStudent.enrollments[0]?.grade ??
              "10",

            className: data.className ?? existingEnrollment?.className ?? null,
          },
        });
      }

      /*
       * Return the complete updated student.
       */
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

    /*
     * Soft delete:
     * We keep the student and all historical data,
     * but remove them from the active student list.
     */
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
