import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import {
  isValidJalaliDate,
  jalaliToGregorian,
  normalizeDigits,
} from "@/lib/date/jalali";

const iranianNationalIdSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد.")
  .refine((value) => {
    if (/^(\d)\1{9}$/.test(value)) return false;

    const digits = value.split("").map(Number);

    const sum = digits
      .slice(0, 9)
      .reduce((total, digit, index) => total + digit * (10 - index), 0);

    const remainder = sum % 11;
    const checkDigit = digits[9];

    return checkDigit === (remainder < 2 ? remainder : 11 - remainder);
  }, "کد ملی معتبر نیست.");

const optionalNationalIdSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || iranianNationalIdSchema.safeParse(value).success,
    "کد ملی معتبر نیست.",
  )
  .optional()
  .nullable();

const mobileSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, "شماره تلفن همراه معتبر نیست.");

const admissionApplicationSchema = z.object({
  studentFirstName: z.string().trim().min(1).max(100),

  studentLastName: z.string().trim().min(1).max(100),

  birthDate: z
    .string()
    .trim()
    .transform(normalizeDigits)
    .refine(
      (value) => /^\d{4}\/\d{2}\/\d{2}$/.test(value),
      "تاریخ تولد باید به صورت ۱۴۰۰/۰۱/۰۱ باشد.",
    )
    .refine(isValidJalaliDate, "تاریخ تولد معتبر نیست."),

  nationalId: iranianNationalIdSchema,

  birthCertificateSerial: z.string().trim().max(50).optional().nullable(),

  requestedGrade: z.string().trim().min(1).max(50),

  studentMobile: mobileSchema,

  fatherFirstName: z.string().trim().min(1).max(100),

  fatherLastName: z.string().trim().min(1).max(100),

  fatherNationalId: optionalNationalIdSchema,

  fatherJob: z.string().trim().max(150).optional().nullable(),

  fatherEducation: z.string().trim().max(100).optional().nullable(),

  fatherMobile: mobileSchema,

  motherFirstName: z.string().trim().min(1).max(100),

  motherLastName: z.string().trim().min(1).max(100),

  motherNationalId: optionalNationalIdSchema,

  motherJob: z.string().trim().max(150).optional().nullable(),

  motherEducation: z.string().trim().max(100).optional().nullable(),

  motherMobile: mobileSchema,

  address: z.string().trim().min(1).max(1000),

  landline: z.string().trim().max(30).optional().nullable(),

  description: z.string().trim().max(2000).optional().nullable(),
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
     * birthDate is Jalali at the API boundary.
     * Convert it to Gregorian DateTime before Prisma.
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
