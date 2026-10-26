import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const transferSchema = z.object({
  studentId: z.string().trim().min(1),
  sourceAcademicYearId: z.string().trim().min(1),
  targetAcademicYearId: z.string().trim().min(1),
  targetGrade: z.enum(["10", "11", "12"]),
  targetClassId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await requirePermission("students.edit");

    const parsed = transferSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "اطلاعات انتقال تحصیلی معتبر نیست.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { studentId, sourceAcademicYearId, targetAcademicYearId, targetGrade, targetClassId } = parsed.data;

    if (sourceAcademicYearId === targetAcademicYearId) {
      return NextResponse.json({ error: "سال تحصیلی مبدأ و مقصد باید متفاوت باشند." }, { status: 400 });
    }

    const [student, sourceYear, targetYear, targetClass] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          isActive: true,
          enrollments: {
            where: { academicYearId: sourceAcademicYearId },
            select: { id: true, academicYearId: true, grade: true, classId: true, className: true },
          },
        },
      }),
      prisma.academicYear.findUnique({ where: { id: sourceAcademicYearId }, select: { id: true, title: true } }),
      prisma.academicYear.findUnique({ where: { id: targetAcademicYearId }, select: { id: true, title: true } }),
      prisma.class.findUnique({
        where: { id: targetClassId },
        select: { id: true, academicYearId: true, grade: true, name: true, isActive: true },
      }),
    ]);

    if (!student) return NextResponse.json({ error: "دانش‌آموز موردنظر یافت نشد." }, { status: 404 });
    if (!student.isActive) return NextResponse.json({ error: "دانش‌آموز غیرفعال است." }, { status: 400 });
    if (!sourceYear) return NextResponse.json({ error: "سال تحصیلی مبدأ یافت نشد." }, { status: 400 });
    if (!targetYear) return NextResponse.json({ error: "سال تحصیلی مقصد یافت نشد." }, { status: 400 });
    if (!student.enrollments[0]) return NextResponse.json({ error: "دانش‌آموز در سال تحصیلی مبدأ ثبت‌نام ندارد." }, { status: 400 });
    if (!targetClass) return NextResponse.json({ error: "کلاس مقصد یافت نشد." }, { status: 400 });
    if (!targetClass.isActive) return NextResponse.json({ error: "کلاس مقصد غیرفعال است." }, { status: 400 });
    if (targetClass.academicYearId !== targetAcademicYearId || targetClass.grade !== targetGrade) {
      return NextResponse.json({ error: "کلاس مقصد با سال تحصیلی یا پایه انتخاب‌شده سازگار نیست." }, { status: 400 });
    }

    const existingTargetEnrollment = await prisma.studentEnrollment.findUnique({
      where: { studentId_academicYearId: { studentId, academicYearId: targetAcademicYearId } },
      select: { id: true },
    });

    if (existingTargetEnrollment) {
      return NextResponse.json(
        { error: "این دانش‌آموز برای سال تحصیلی مقصد قبلاً ثبت‌نام شده است. برای تغییر کلاس، از ویرایش همان ثبت‌نام استفاده کنید." },
        { status: 409 },
      );
    }

    try {
      const enrollment = await prisma.studentEnrollment.create({
        data: {
          studentId,
          academicYearId: targetAcademicYearId,
          grade: targetGrade,
          classId: targetClass.id,
          className: targetClass.name,
        },
        include: { academicYear: true, class: true },
      });

      return NextResponse.json({
        success: true,
        enrollment,
        source: { academicYearId: sourceYear.id, title: sourceYear.title },
        target: { academicYearId: targetYear.id, title: targetYear.title, grade: targetGrade, className: targetClass.name },
      }, { status: 201 });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return NextResponse.json(
          { error: "این دانش‌آموز برای سال تحصیلی مقصد قبلاً ثبت‌نام شده است." },
          { status: 409 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("POST /api/admin/student-academic-transfer error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز انتقال تحصیلی دانش‌آموز را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "انتقال تحصیلی دانش‌آموز انجام نشد." }, { status: 500 });
  }
}
