import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ semester: z.enum(["FIRST", "SECOND"]).optional(), isPublished: z.boolean().optional() });

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("top_students.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات انتخاب معتبر نیست." }, { status: 400 });
    const { id } = await context.params;
    return NextResponse.json(await prisma.outstandingStudent.update({ where: { id }, data: result.data }));
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت دانش‌آموزان ممتاز را ندارید." : "خطا در ویرایش انتخاب" }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requirePermission("top_students.manage");
    const { id } = await context.params;
    await prisma.outstandingStudent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت دانش‌آموزان ممتاز را ندارید." : "خطا در حذف انتخاب" }, { status });
  }
}
