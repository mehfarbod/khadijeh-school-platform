import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { getTargetGrade } from "@/lib/student-promotion";

const schema = z.object({
  sourceAcademicYearId: z.string().min(1), targetAcademicYearId: z.string().min(1),
  decisions: z.array(z.object({ studentId: z.string().min(1), outcome: z.enum(["PROMOTE", "REPEAT"]), targetClassName: z.string().trim().max(50).nullable() })).min(1).max(1000),
}).superRefine((value, ctx) => {
  if (value.sourceAcademicYearId === value.targetAcademicYearId) ctx.addIssue({ code: "custom", message: "سال مبدأ و مقصد باید متفاوت باشند." });
  if (new Set(value.decisions.map((item) => item.studentId)).size !== value.decisions.length) ctx.addIssue({ code: "custom", message: "یک دانش‌آموز بیش از یک بار انتخاب شده است." });
});

export async function POST(request: NextRequest) {
  try {
    await requirePermission("academic_years.manage");
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات ارتقا معتبر نیست." }, { status: 400 });
    const data = parsed.data;
    const result = await prisma.$transaction(async (tx) => {
      const years = await tx.academicYear.findMany({ where: { id: { in: [data.sourceAcademicYearId, data.targetAcademicYearId] } }, select: { id: true } });
      if (years.length !== 2) throw new Error("YEAR_NOT_FOUND");
      const source = await tx.studentEnrollment.findMany({ where: { academicYearId: data.sourceAcademicYearId, studentId: { in: data.decisions.map((item) => item.studentId) } }, select: { studentId: true, grade: true } });
      if (source.length !== data.decisions.length) throw new Error("SOURCE_ENROLLMENT_NOT_FOUND");
      const sourceByStudent = new Map(source.map((item) => [item.studentId, item]));
      const existing = await tx.studentEnrollment.findMany({ where: { academicYearId: data.targetAcademicYearId, studentId: { in: data.decisions.map((item) => item.studentId) } }, select: { studentId: true } });
      if (existing.length) throw new Error("TARGET_ENROLLMENT_EXISTS");
      const creates = data.decisions.map((decision) => {
        const sourceEnrollment = sourceByStudent.get(decision.studentId)!;
        const targetGrade = getTargetGrade(sourceEnrollment.grade, decision.outcome);
        if (!targetGrade) throw new Error("INVALID_TRANSITION");
        return { studentId: decision.studentId, academicYearId: data.targetAcademicYearId, grade: targetGrade, className: decision.targetClassName || null };
      });
      await tx.studentEnrollment.createMany({ data: creates });
      return { created: creates.length, promoted: data.decisions.filter((item) => item.outcome === "PROMOTE").length, repeated: data.decisions.filter((item) => item.outcome === "REPEAT").length };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const messages: Record<string, string> = { YEAR_NOT_FOUND: "سال تحصیلی انتخاب‌شده پیدا نشد.", SOURCE_ENROLLMENT_NOT_FOUND: "ثبت‌نام مبدأ یکی از دانش‌آموزان تغییر کرده یا پیدا نشد.", TARGET_ENROLLMENT_EXISTS: "برای یکی از دانش‌آموزان ثبت‌نامی در سال مقصد وجود دارد. پیش‌نمایش را دوباره بارگذاری کنید.", INVALID_TRANSITION: "انتقال پایه انتخاب‌شده مجاز نیست." };
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت سال‌های تحصیلی را ندارید." }, { status: 403 });
    if (error instanceof Error && messages[error.message]) return NextResponse.json({ error: messages[error.message] }, { status: 409 });
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "ثبت‌نامی در سال مقصد هم‌زمان ایجاد شده است. پیش‌نمایش را دوباره بارگذاری کنید." }, { status: 409 });
    return NextResponse.json({ error: "ثبت ارتقا انجام نشد." }, { status: 500 });
  }
}
