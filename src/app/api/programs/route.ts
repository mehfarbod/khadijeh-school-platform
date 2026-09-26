import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const schema = z.object({
  type: z.enum(["weekly", "exams", "calendar", "parents-meetings", "family-counseling"]),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(2).max(500),
  content: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const type = params.get("type");
    const activeOnly = params.get("activeOnly") !== "false";

    const programs = await prisma.educationalProgram.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error("GET /api/programs error:", error);
    return NextResponse.json({ error: "خطا در دریافت برنامه‌های آموزشی." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const parsed = schema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "اطلاعات برنامه معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const program = await prisma.educationalProgram.create({ data: parsed.data });
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "افزودن برنامه با خطا مواجه شد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه برنامه الزامی است." }, { status: 400 });

    const parsed = schema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات برنامه معتبر نیست." }, { status: 400 });

    const program = await prisma.educationalProgram.update({ where: { id }, data: parsed.data });
    return NextResponse.json(program);
  } catch (error) {
    console.error("PATCH /api/programs error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ویرایش برنامه با خطا مواجه شد." }, { status: 500 });
  }
}