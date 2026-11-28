import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  entranceExamYear: z.string().trim().min(2).max(20),
  major: z.string().trim().min(2).max(150),
  university: z.string().trim().min(2).max(200),
  isPublished: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get("publishedOnly") === "false";
    if (admin) await requirePermission("top_students.manage");
    const records = admin
      ? await prisma.graduate.findMany({ orderBy: [{ entranceExamYear: "desc" }, { lastName: "asc" }], select: { id: true, firstName: true, lastName: true, entranceExamYear: true, major: true, university: true, isPublished: true } })
      : await prisma.graduate.findMany({ where: { isPublished: true }, orderBy: [{ entranceExamYear: "desc" }, { lastName: "asc" }], select: { firstName: true, lastName: true, entranceExamYear: true, major: true, university: true } });
    return NextResponse.json(records);
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت فارغ‌التحصیلان را ندارید." : "خطا در دریافت فارغ‌التحصیلان" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("top_students.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات فارغ‌التحصیل معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    return NextResponse.json(await prisma.graduate.create({ data: { ...result.data, isPublished: result.data.isPublished ?? false } }), { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت فارغ‌التحصیلان را ندارید." : "خطا در ایجاد فارغ‌التحصیل" }, { status });
  }
}
