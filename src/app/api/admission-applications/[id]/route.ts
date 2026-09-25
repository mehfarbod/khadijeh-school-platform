import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const updateAdmissionApplicationSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),

    rejectionReason: z.string().trim().max(1000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "REJECTED" && !data.rejectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rejectionReason"],
        message: "دلیل رد درخواست الزامی است.",
      });
    }
  });

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;

    const body = await request.json();

    const result = updateAdmissionApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "اطلاعات واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { status, rejectionReason } = result.data;

    const application = await prisma.admissionApplication.findUnique({
      where: {
        id,
      },

      include: {
        academicYear: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          error: "درخواست ثبت‌نام پیدا نشد.",
        },
        { status: 404 },
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "فقط درخواست‌های در انتظار بررسی قابل تغییر هستند.",
        },
        { status: 409 },
      );
    }

    /*
     * REJECT
     */
    if (status === "REJECTED") {
      const updatedApplication = await prisma.admissionApplication.update({
        where: {
          id,
        },

        data: {
          status: "REJECTED",

          rejectionReason: rejectionReason?.trim() || null,

          reviewedAt: new Date(),
        },

        include: {
          academicYear: true,
        },
      });

      return NextResponse.json({
        message: "درخواست ثبت‌نام رد شد.",
        application: updatedApplication,
      });
    }

    /*
     * APPROVE
     *
     * Student + StudentEnrollment + AdmissionApplication
     * are updated together inside one transaction.
     */
    const resultTransaction = await prisma.$transaction(async (tx) => {
      const existingStudent = await tx.student.findUnique({
        where: {
          nationalId: application.nationalId,
        },

        select: {
          id: true,
        },
      });

      if (existingStudent) {
        throw new Error("STUDENT_ALREADY_EXISTS");
      }

      /*
       * Create student with complete registration information.
       */
      const student = await tx.student.create({
        data: {
          // Student information
          firstName: application.studentFirstName,

          lastName: application.studentLastName,

          nationalId: application.nationalId,

          birthCertificateSerial: application.birthCertificateSerial || null,

          mobile: application.studentMobile,

          /*
           * application.birthDate is already
           * a Gregorian DateTime from Prisma.
           */
          birthday: application.birthDate,

          // Father information
          fatherFirstName: application.fatherFirstName,

          fatherLastName: application.fatherLastName,

          fatherNationalId: application.fatherNationalId,

          fatherJob: application.fatherJob,

          fatherEducation: application.fatherEducation,

          fatherMobile: application.fatherMobile,

          // Mother information
          motherFirstName: application.motherFirstName,

          motherLastName: application.motherLastName,

          motherNationalId: application.motherNationalId,

          motherJob: application.motherJob,

          motherEducation: application.motherEducation,

          motherMobile: application.motherMobile,

          // Contact information
          address: application.address,

          landline: application.landline,

          description: application.description,

          /*
           * Legacy guardian fields.
           *
           * These are kept temporarily for compatibility with
           * older parts of the system.
           */
        
          /*
           * Email is intentionally left null for now.
           * It is optional in the Student model and can be
           * added later if needed.
           */
          email: null,
        },
      });

      /*
       * Create enrollment for the selected academic year.
       */
      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId: student.id,

          academicYearId: application.academicYearId,

          grade: application.requestedGrade,
        },
      });

      /*
       * Mark the admission application as approved.
       */
      const updatedApplication = await tx.admissionApplication.update({
        where: {
          id: application.id,
        },

        data: {
          status: "APPROVED",

          rejectionReason: null,

          reviewedAt: new Date(),
        },

        include: {
          academicYear: true,
        },
      });

      return {
        student,
        enrollment,
        application: updatedApplication,
      };
    });

    return NextResponse.json({
      message: "درخواست تأیید شد و دانش‌آموز با موفقیت ایجاد شد.",

      ...resultTransaction,
    });
  } catch (error) {
    console.error("PATCH /api/admission-applications/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          error: "احراز هویت الزامی است.",
        },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          error: "شما مجوز مدیریت درخواست‌های ثبت‌نام را ندارید.",
        },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "STUDENT_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          error: "دانش‌آموزی با این کد ملی قبلاً در سیستم ثبت شده است.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "خطا در تغییر وضعیت درخواست ثبت‌نام.",
      },
      { status: 500 },
    );
  }
}
