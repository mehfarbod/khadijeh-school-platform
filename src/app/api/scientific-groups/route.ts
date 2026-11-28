import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2, "نام گروه الزامی است.").max(150),
  description: z.string().trim().max(1000).nullable().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get("publishedOnly") === "false";
    if (admin) await requirePermission("programs.manage");
    const groups = await prisma.scientificGroup.findMany({
      where: admin ? undefined : { isPublished: true },
      orderBy: { name: "asc" },
      include: {
        minutes: {
          where: admin ? undefined : { isPublished: true },
          orderBy: [{ heldOn: "desc" }, { createdAt: "desc" }],
        },
      },
    });
    return NextResponse.json(groups);
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "مجوز مدیریت گروه‌های علمی را ندارید." : "خطا در دریافت گروه‌های علمی" }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "اطلاعات گروه معتبر نیست.", details: result.error.flatten().fieldErrors }, { status: 400 });
    const data = result.data;
    const group = await prisma.scientificGroup.create({ data: { name: data.name, description: data.description || null, isPublished: data.isPublished ?? false } });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : error instanceof Error && error.message === "FORBIDDEN" ? 403 : typeof error === "object" && error !== null && "code" in error && error.code === "P2002" ? 409 : 500;
    return NextResponse.json({ error: status === 409 ? "گروهی با این نام قبلاً ثبت شده است." : status === 403 ? "مجوز مدیریت گروه‌های علمی را ندارید." : "خطا در ایجاد گروه علمی" }, { status });
  }
}
