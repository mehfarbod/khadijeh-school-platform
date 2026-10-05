import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { getTargetGrade, suggestedPromotionOutcome } from "@/lib/student-promotion";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("academic_years.manage");
    const params = new URL(request.url).searchParams;
    const sourceAcademicYearId = params.get("sourceAcademicYearId") ?? "";
    const targetAcademicYearId = params.get("targetAcademicYearId") ?? "";
    const grade = params.get("grade") || undefined;
    const className = params.get("className") || undefined;

    if (!sourceAcademicYearId || !targetAcademicYearId || sourceAcademicYearId === targetAcademicYearId) {
      return NextResponse.json({ error: "سال مبدأ و مقصد باید متفاوت و معتبر باشند." }, { status: 400 });
    }

    const [sourceYear, targetYear] = await Promise.all([
      prisma.academicYear.findUnique({ where: { id: sourceAcademicYearId }, select: { id: true, title: true } }),
      prisma.academicYear.findUnique({ where: { id: targetAcademicYearId }, select: { id: true, title: true } }),
    ]);
    if (!sourceYear || !targetYear) return NextResponse.json({ error: "سال تحصیلی انتخاب‌شده پیدا نشد." }, { status: 400 });

    const sourceEnrollments = await prisma.studentEnrollment.findMany({
      where: { academicYearId: sourceYear.id, ...(grade ? { grade } : {}), ...(className ? { className } : {}) },
      select: { studentId: true, grade: true, className: true, student: { select: { firstName: true, lastName: true } } },
      orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
    });
    const targetEnrollments = await prisma.studentEnrollment.findMany({
      where: { academicYearId: targetYear.id, studentId: { in: sourceEnrollments.map((item) => item.studentId) } },
      select: { studentId: true, grade: true, className: true },
    });
    const targetByStudent = new Map(targetEnrollments.map((item) => [item.studentId, item]));
    const targetClasses = await prisma.studentEnrollment.findMany({
      where: { academicYearId: targetYear.id, className: { not: null } },
      select: { className: true }, distinct: ["className"], orderBy: { className: "asc" },
    });

    const rows = sourceEnrollments.map((item) => {
      const existing = targetByStudent.get(item.studentId);
      const outcome = suggestedPromotionOutcome(item.grade);
      return {
        studentId: item.studentId, firstName: item.student.firstName, lastName: item.student.lastName,
        sourceGrade: item.grade, sourceClassName: item.className,
        outcome: existing ? "EXISTING" : outcome,
        targetGrade: existing ? existing.grade : getTargetGrade(item.grade, outcome),
        targetClassName: existing ? existing.className : item.className,
      };
    });
    return NextResponse.json({ sourceYear, targetYear, rows, targetClasses: targetClasses.flatMap((item) => item.className ? [item.className] : []) });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت سال‌های تحصیلی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در آماده‌سازی پیش‌نمایش ارتقا." }, { status: 500 });
  }
}
