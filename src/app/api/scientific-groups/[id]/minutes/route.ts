import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ title: z.string().trim().min(2).max(200), heldOn: z.string().datetime().nullable().optional(), content: z.string().trim().min(2).max(20000), isPublished: z.boolean().optional() });

export async function POST(request: NextRequest, context: Context) {
  try {
    await requirePermission("programs.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات صورت‌جلسه معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    const { id } = await context.params;
    const data = result.data;
    return NextResponse.json(await prisma.scientificGroupMinute.create({ data: { groupId: id, title: data.title, heldOn: data.heldOn ? new Date(data.heldOn) : null, content: data.content, isPublished: data.isPublished ?? false } }), { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت گروه‌های علمی را ندارید." : "خطا در ایجاد صورت‌جلسه" }, { status });
  }
}
