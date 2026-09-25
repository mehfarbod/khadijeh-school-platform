import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { jalaliToGregorian } from "@/lib/date/jalali";
import {
  iranianNationalIdSchema,
  iranianMobileSchema,
  optionalNationalIdSchema,
  gradeSchema,
  jalaliBirthdaySchema,
} from "@/lib/validation/student";

const admissionApplicationSchema = z.object({
  studentFirstName: z
    .string()
    .trim()
    .min(1, "نام دانش‌آموز الزامی است.")
    .max(100, "نام دانش‌آموز بیش از حد طولانی است."),

  studentLastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی دانش‌آموز الزامی است.")
    .max(100, "نام خانوادگی دانش‌آموز بیش از حد طولانی است."),

  birthDate: jalaliBirthdaySchema,

  nationalId: iranianNationalIdSchema,

  birthCertificateSerial: z
    .string()
    .trim()
    .max(100, "شماره سری شناسنامه بیش از حد طولانی است.")
    .optional()
    .nullable(),

  requestedGrade: gradeSchema,

  studentMobile: iranianMobileSchema,

  fatherFirstName: z
    .string()
    .trim()
    .min(1, "نام پدر الزامی است.")
    .max(100, "نام پدر بیش از حد طولانی است."),

  fatherLastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی پدر الزامی است.")
    .max(100, "نام خانوادگی پدر بیش از حد طولانی است."),

  fatherNationalId: optionalNationalIdSchema,

  fatherJob: z
    .string()
    .trim()
    .max(150, "شغل پدر بیش از حد طولانی است.")
    .optional()
    .nullable(),

  fatherEducation: z
    .string()
    .trim()
    .max(150, "تحصیلات پدر بیش از حد طولانی است.")
    .optional()
    .nullable(),

  fatherMobile: iranianMobileSchema,

  motherFirstName: z
    .string()
    .trim()
    .min(1, "نام مادر الزامی است.")
    .max(100, "نام مادر بیش از حد طولانی است."),

  motherLastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی مادر بیش از حد طولانی است.")
    .max(100, "نام خانوادگی مادر بیش از حد طولانی است."),

  motherNationalId: optionalNationalIdSchema,

  motherJob: z
    .string()
    .trim()
    .max(150, "شغل مادر بیش از حد طولانی است.")
    .optional()
    .nullable(),

  motherEducation: z
    .string()
    .trim()
    .max(150, "تحصیلات مادر بیش از حد طولانی است.")
    .optional()
    .nullable(),

  motherMobile: iranianMobileSchema,

  address: z
    .string()
    .trim()
    .min(1, "آدرس الزامی است.")
    .max(1000, "آدرس بیش از حد طولانی است."),

  landline: z
    .string()
    .trim()
    .max(30, "شماره تلفن ثابت بیش از حد طولانی است.")
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(2000, "توضیحات بیش از حد طولانی است.")
    .optional()
    .nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = admissionApplicationSchema.safeParse(body);

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

    /*
     * Registration API receives Jalali date.
     * Convert it to Gregorian DateTime before storing in PostgreSQL.
     */
    const birthDate = new Date(jalaliToGregorian(data.birthDate));

    const academicYear = await prisma.academicYear.findFirst({
      where: {
        isCurrent: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (!academicYear) {
      return NextResponse.json(
        {
          error: "سال تحصیلی جاری در سیستم تعریف نشده است.",
        },
        { status: 400 },
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: {
        nationalId: data.nationalId,
      },
      select: {
        id: true,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error: "این کد ملی قبلاً در سیستم مدرسه ثبت شده است.",
        },
        { status: 409 },
      );
    }

    const application = await prisma.admissionApplication.create({
      data: {
        studentFirstName: data.studentFirstName,
        studentLastName: data.studentLastName,

        birthDate,

        nationalId: data.nationalId,

        birthCertificateSerial: data.birthCertificateSerial || null,

        requestedGrade: data.requestedGrade,

        studentMobile: data.studentMobile,

        fatherFirstName: data.fatherFirstName,
        fatherLastName: data.fatherLastName,
        fatherNationalId: data.fatherNationalId || null,
        fatherJob: data.fatherJob || null,
        fatherEducation: data.fatherEducation || null,
        fatherMobile: data.fatherMobile,

        motherFirstName: data.motherFirstName,
        motherLastName: data.motherLastName,
        motherNationalId: data.motherNationalId || null,
        motherJob: data.motherJob || null,
        motherEducation: data.motherEducation || null,
        motherMobile: data.motherMobile,

        address: data.address,
        landline: data.landline || null,
        description: data.description || null,

        academicYearId: academicYear.id,
      },

      include: {
        academicYear: true,
      },
    });

    return NextResponse.json(
      {
        message: "درخواست ثبت‌نام با موفقیت ثبت شد.",
        application,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admission-applications error:", error);

    return NextResponse.json(
      {
        error: "خطا در ثبت درخواست ثبت‌نام.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const academicYearId = searchParams.get("academicYearId");

    const applications = await prisma.admissionApplication.findMany({
      where: {
        ...(status ? { status: status as any } : {}),

        ...(academicYearId ? { academicYearId } : {}),
      },

      include: {
        academicYear: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/admission-applications error:", error);

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
          error: "شما مجوز مشاهده درخواست‌های ثبت‌نام را ندارید.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: "خطا در دریافت درخواست‌های ثبت‌نام.",
      },
      { status: 500 },
    );
  }
}
