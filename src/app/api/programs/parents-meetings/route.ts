import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const schema = z.object({
  title: z.string().trim().min(2).max(200),
  date: z.string().trim().min(1).max(30),
  time: z.string().trim().max(20).optional(),
  topic: z.string().trim().min(2).max(300),
  audience: z.string().trim().max(300).optional(),
  description: z.string().trim().min(2).max(3000),
  location: z.string().trim().max(300).optional(),
  imageUrl: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
});

async function getProgram() {
  return prisma.educationalProgram.findUnique({ where: { type: "parents-meetings" } });
}

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const activeOnly = params.get("activeOnly") !== "false";
    const program = await getProgram();
    if (!program) return NextResponse.json({ error: "بخش انجمن اولیا و مربیان یافت نشد." }, { status: 404 });

    const meetings = await prisma.parentMeeting.findMany({
      where: { programId: program.id, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({ program, meetings });
  } catch (error) {
    console.error("GET /api/programs/parents-meetings error:", error);
    return NextResponse.json({ error: "خطا در دریافت جلسات انجمن." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات جلسه معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const program = await getProgram();
    if (!program) return NextResponse.json({ error: "تعریف جلسات انجمن پیدا نشد." }, { status: 404 });

    const meeting = await prisma.parentMeeting.create({ data: { ...parsed.data, programId: program.id } });
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs/parents-meetings error:", error);
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
    const meeting = await prisma.parentMeeting.update({ where: { id }, data: parsed.data });
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("PATCH /api/programs/parents-meetings error:", error);
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
    await prisma.parentMeeting.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/programs/parents-meetings error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "حذف جلسه با خطا مواجه شد." }, { status: 500 });
  }
}
