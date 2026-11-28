import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ name: z.string().trim().min(2).max(150).optional(), description: z.string().trim().max(1000).nullable().optional(), isPublished: z.boolean().optional() });

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("programs.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات گروه معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    const { id } = await context.params;
    const data = result.data;
    return NextResponse.json(await prisma.scientificGroup.update({ where: { id }, data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
    } }));
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت گروه‌های علمی را ندارید." : "خطا در ویرایش گروه علمی" }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requirePermission("programs.manage");
    const { id } = await context.params;
    await prisma.scientificGroup.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت گروه‌های علمی را ندارید." : "خطا در حذف گروه علمی" }, { status });
  }
}
