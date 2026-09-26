import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const schema = z.object({
  title: z.string().trim().min(2).max(200),
  date: z.string().trim().min(1).max(30),
  time: z.string().trim().max(20).optional(),
  counselor: z.string().trim().min(2).max(150),
  topic: z.string().trim().min(2).max(300),
  audience: z.string().trim().max(300).optional(),
  description: z.string().trim().min(2).max(3000),
  location: z.string().trim().max(300).optional(),
  imageUrl: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
});

async function getProgram() {
  return prisma.educationalProgram.findUnique({ where: { type: "family-counseling" } });
}

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const activeOnly = params.get("activeOnly") !== "false";
    const program = await getProgram();
    if (!program) return NextResponse.json({ error: "بخش مشاوره خانواده یافت نشد." }, { status: 404 });

    const sessions = await prisma.familyCounselingSession.findMany({
      where: { programId: program.id, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({ program, sessions });
  } catch (error) {
    console.error("GET /api/programs/family-counseling error:", error);
    return NextResponse.json({ error: "خطا در دریافت جلسات مشاوره خانواده." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات جلسه معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const program = await getProgram();
    if (!program) return NextResponse.json({ error: "تعریف مشاوره خانواده پیدا نشد." }, { status: 404 });

    const session = await prisma.familyCounselingSession.create({ data: { ...parsed.data, programId: program.id } });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs/family-counseling error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "افزودن جلسه با خطا مواجه شد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه جلسه الزامی است." }, { status: 400 });
    const parsed = schema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات جلسه معتبر نیست." }, { status: 400 });
    const session = await prisma.familyCounselingSession.update({ where: { id }, data: parsed.data });
    return NextResponse.json(session);
  } catch (error) {
    console.error("PATCH /api/programs/family-counseling error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ویرایش جلسه با خطا مواجه شد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه جلسه الزامی است." }, { status: 400 });
    await prisma.familyCounselingSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/programs/family-counseling error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "حذف جلسه با خطا مواجه شد." }, { status: 500 });
  }
}
