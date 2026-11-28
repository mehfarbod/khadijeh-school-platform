import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

const schema = z.object({ studentId: z.string().trim().min(1), academicYearId: z.string().trim().min(1), semester: z.enum(["FIRST", "SECOND"]), isPublished: z.boolean().optional() });

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get("publishedOnly") === "false";
    if (admin) await requirePermission("top_students.manage");
    const records = admin
      ? await prisma.outstandingStudent.findMany({ orderBy: [{ academicYear: { title: "desc" } }, { semester: "asc" }, { student: { lastName: "asc" } }], select: { id: true, semester: true, isPublished: true, studentId: true, academicYearId: true, student: { select: { firstName: true, lastName: true } }, academicYear: { select: { title: true } } } })
      : await prisma.outstandingStudent.findMany({ where: { isPublished: true, student: { isActive: true } }, orderBy: [{ academicYear: { title: "desc" } }, { semester: "asc" }, { student: { lastName: "asc" } }], select: { semester: true, student: { select: { firstName: true, lastName: true } }, academicYear: { select: { title: true } } } });
    return NextResponse.json(records);
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت دانش‌آموزان ممتاز را ندارید." : "خطا در دریافت دانش‌آموزان ممتاز" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("top_students.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات انتخاب معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    const student = await prisma.student.findFirst({ where: { id: result.data.studentId, isActive: true, enrollments: { some: { academicYearId: result.data.academicYearId } } }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "دانش‌آموز در سال تحصیلی انتخاب‌شده ثبت‌نام فعال ندارد." }, { status: 400 });
    return NextResponse.json(await prisma.outstandingStudent.create({ data: { ...result.data, isPublished: result.data.isPublished ?? false } }), { status: 201 });
  } catch (error) {
    const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : duplicate ? 409 : 500;
    return NextResponse.json({ error: duplicate ? "این دانش‌آموز برای این نیم‌سال قبلاً انتخاب شده است." : status === 403 ? "مجوز مدیریت دانش‌آموزان ممتاز را ندارید." : "خطا در ایجاد انتخاب" }, { status });
  }
}
