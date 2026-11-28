import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ firstName: z.string().trim().min(1).max(100).optional(), lastName: z.string().trim().min(1).max(100).optional(), entranceExamYear: z.string().trim().min(2).max(20).optional(), major: z.string().trim().min(2).max(150).optional(), university: z.string().trim().min(2).max(200).optional(), isPublished: z.boolean().optional() });

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("top_students.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات فارغ‌التحصیل معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    const { id } = await context.params;
    return NextResponse.json(await prisma.graduate.update({ where: { id }, data: result.data }));
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت فارغ‌التحصیلان را ندارید." : "خطا در ویرایش فارغ‌التحصیل" }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requirePermission("top_students.manage");
    const { id } = await context.params;
    await prisma.graduate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت فارغ‌التحصیلان را ندارید." : "خطا در حذف فارغ‌التحصیل" }, { status });
  }
}
