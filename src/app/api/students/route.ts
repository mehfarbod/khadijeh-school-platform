import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission, requireRole } from "@/lib/auth/authorization";
import { getTeacherClassIds } from "@/lib/auth/teacher-access";
import { jalaliToGregorian } from "@/lib/date/jalali";
import { prisma } from "@/lib/prisma";
import {
  gradeSchema,
  optionalJalaliBirthdaySchema,
  optionalMobileSchema,
  optionalNationalIdSchema,
} from "@/lib/validation/student";

const studentSchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است.").max(100, "نام بیش از حد طولانی است."),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است.").max(100, "نام خانوادگی بیش از حد طولانی است."),
  nationalId: optionalNationalIdSchema,
  birthCertificateSerial: z.string().trim().max(100, "شماره سری شناسنامه بیش از حد طولانی است.").nullable().optional(),
  mobile: optionalMobileSchema,
  photo: z.string().trim().max(2000, "آدرس تصویر بیش از حد طولانی است.").nullable().optional(),
  birthday: optionalJalaliBirthdaySchema,
  fatherFirstName: z.string().trim().max(100, "نام بیش از حد طولانی است.").nullable().optional(),
  fatherLastName: z.string().trim().max(100, "نام خانوادگی بیش از حد طولانی است.").nullable().optional(),
  fatherNationalId: optionalNationalIdSchema,
  fatherJob: z.string().trim().max(150, "شغل پدر بیش از حد طولانی است.").nullable().optional(),
  fatherEducation: z.string().trim().max(150, "تحصیلات پدر بیش از حد طولانی است.").nullable().optional(),
  fatherMobile: optionalMobileSchema,
  motherFirstName: z.string().trim().max(100, "نام بیش از حد طولانی است.").nullable().optional(),
  motherLastName: z.string().trim().max(100, "نام خانوادگی بیش از حد طولانی است.").nullable().optional(),
  motherNationalId: optionalNationalIdSchema,
  motherJob: z.string().trim().max(150, "شغل مادر بیش از حد طولانی است.").nullable().optional(),
  motherEducation: z.string().trim().max(150, "تحصیلات مادر بیش از حد طولانی است.").nullable().optional(),
  motherMobile: optionalMobileSchema,
  address: z.string().trim().max(1000, "آدرس بیش از حد طولانی است.").nullable().optional(),
  landline: z.string().trim().max(30, "شماره تلفن ثابت بیش از حد طولانی است.").nullable().optional(),
  description: z.string().trim().max(2000, "توضیحات بیش از حد طولانی است.").nullable().optional(),
  academicYearId: z.string().trim().min(1, "سال تحصیلی الزامی است."),
  grade: gradeSchema,
  classId: z.string().trim().min(1).nullable().optional(),
  className: z.string().trim().max(50, "نام کلاس بیش از حد طولانی است.").nullable().optional(),
  isActive: z.boolean().optional(),
});

async function resolveClassId(data: z.infer<typeof studentSchema>) {
  if (data.classId) {
    const classRecord = await prisma.class.findUnique({ where: { id: data.classId }, select: { id: true, academicYearId: true, grade: true, isActive: true } });
    if (!classRecord) throw new Error("CLASS_NOT_FOUND");
    if (!classRecord.isActive) throw new Error("CLASS_INACTIVE");
    if (classRecord.academicYearId !== data.academicYearId || classRecord.grade !== data.grade) throw new Error("CLASS_MISMATCH");
    return classRecord.id;
  }
  if (data.className?.trim()) {
    const classRecord = await prisma.class.findUnique({ where: { academicYearId_grade_name: { academicYearId: data.academicYearId, grade: data.grade, name: data.className.trim() } }, select: { id: true, isActive: true } });
    if (!classRecord) throw new Error("CLASS_NOT_FOUND");
    if (!classRecord.isActive) throw new Error("CLASS_INACTIVE");
    return classRecord.id;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    if (session.user.role !== "TEACHER") await requirePermission("students.view");

    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId");
    const grade = searchParams.get("grade");
    const className = searchParams.get("className");
    const classId = searchParams.get("classId");
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const inactiveOnly = searchParams.get("inactiveOnly") === "true";
    const teacherClassIds = session.user.role === "TEACHER" ? await getTeacherClassIds(session.user.id, academicYearId || undefined) : null;

    if (teacherClassIds?.length === 0) return NextResponse.json([]);

    const enrollmentWhere = {
      ...(academicYearId ? { academicYearId } : {}),
      ...(grade ? { grade } : {}),
      ...(className ? { className } : {}),
      ...(classId ? { classId } : {}),
      ...(teacherClassIds ? { classId: { in: teacherClassIds } } : {}),
    };
    const mustFilterByEnrollment = !!teacherClassIds || (!inactiveOnly && (!!academicYearId || !!grade || !!className || !!classId));

    const students = await prisma.student.findMany({
      where: {
        ...(inactiveOnly ? { isActive: false } : activeOnly ? { isActive: true } : {}),
        ...(mustFilterByEnrollment ? { enrollments: { some: enrollmentWhere } } : {}),
      },
      include: {
        enrollments: {
          where: mustFilterByEnrollment ? enrollmentWhere : undefined,
          include: { academicYear: true, class: true },
          orderBy: { academicYear: { title: "desc" } },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مشاهده اطلاعات دانش‌آموزان را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در دریافت اطلاعات دانش‌آموزان" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.create");

    const result = studentSchema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات واردشده معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    const data = result.data;
    const academicYear = await prisma.academicYear.findUnique({ where: { id: data.academicYearId } });
    if (!academicYear) return NextResponse.json({ error: "سال تحصیلی انتخاب‌شده یافت نشد." }, { status: 400 });

    let classId: string | null = null;
    try {
      classId = await resolveClassId(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const errors: Record<string, string> = {
        CLASS_NOT_FOUND: "کلاس انتخاب‌شده یافت نشد. ابتدا کلاس را در مدیریت کلاس‌ها تعریف کنید.",
        CLASS_INACTIVE: "کلاس انتخاب‌شده غیرفعال است.",
        CLASS_MISMATCH: "کلاس انتخاب‌شده با سال تحصیلی یا پایه دانش‌آموز سازگار نیست.",
      };
      if (errors[message]) return NextResponse.json({ error: errors[message] }, { status: 400 });
      throw error;
    }

    if (!classId) {
      return NextResponse.json({ error: "برای ثبت دانش‌آموز باید ابتدا یک کلاس فعال توسط مدیریت تعریف و انتخاب شود." }, { status: 400 });
    }

    const birthday = data.birthday ? new Date(jalaliToGregorian(data.birthday)) : null;
    const student = await prisma.student.create({
      data: {
        firstName: data.firstName, lastName: data.lastName, nationalId: data.nationalId || null, birthCertificateSerial: data.birthCertificateSerial || null,
        mobile: data.mobile || null, photo: data.photo || null, birthday, isBirthdayVisible: true,
        fatherFirstName: data.fatherFirstName || null, fatherLastName: data.fatherLastName || null, fatherNationalId: data.fatherNationalId || null,
        fatherJob: data.fatherJob || null, fatherEducation: data.fatherEducation || null, fatherMobile: data.fatherMobile || null,
        motherFirstName: data.motherFirstName || null, motherLastName: data.motherLastName || null, motherNationalId: data.motherNationalId || null,
        motherJob: data.motherJob || null, motherEducation: data.motherEducation || null, motherMobile: data.motherMobile || null,
        address: data.address || null, landline: data.landline || null, description: data.description || null, isActive: data.isActive ?? true,
        enrollments: { create: { academicYearId: data.academicYearId, grade: data.grade, className: data.className || null, classId } },
        studentAccount: { create: {} },
      },
      include: { enrollments: { include: { academicYear: true, class: true } } },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز انجام این عملیات را ندارید." }, { status: 403 });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ error: "دانش‌آموزی با این کد ملی قبلاً در سیستم ثبت شده است." }, { status: 409 });
    return NextResponse.json({ error: "خطا در ایجاد دانش‌آموز" }, { status: 500 });
  }
}
