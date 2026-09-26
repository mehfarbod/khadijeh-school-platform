import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const schema = z.object({
  title: z.string().trim().min(2).max(200),
  date: z.string().trim().min(1).max(30),
  eventType: z.string().trim().min(1).max(50),
  description: z.string().trim().min(2).max(2000),
  imageUrl: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
});

async function getProgram() {
  return prisma.educationalProgram.findUnique({ where: { type: "calendar" } });
}

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const activeOnly = params.get("activeOnly") !== "false";
    const program = await getProgram();
    if (!program) return NextResponse.json({ error: "تقویم آموزشی یافت نشد." }, { status: 404 });

    const events = await prisma.educationalCalendarEvent.findMany({
      where: { programId: program.id, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ program, events });
  } catch (error) {
    console.error("GET /api/programs/calendar error:", error);
    return NextResponse.json({ error: "خطا در دریافت تقویم آموزشی." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات رویداد معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const program = await getProgram();
    if (!program) return NextResponse.json({ error: "تعریف تقویم آموزشی پیدا نشد." }, { status: 404 });

    const event = await prisma.educationalCalendarEvent.create({ data: { ...parsed.data, programId: program.id } });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs/calendar error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "افزودن رویداد با خطا مواجه شد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه رویداد الزامی است." }, { status: 400 });
    const parsed = schema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات رویداد معتبر نیست." }, { status: 400 });
    const event = await prisma.educationalCalendarEvent.update({ where: { id }, data: parsed.data });
    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH /api/programs/calendar error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ویرایش رویداد با خطا مواجه شد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه رویداد الزامی است." }, { status: 400 });
    await prisma.educationalCalendarEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/programs/calendar error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "حذف رویداد با خطا مواجه شد." }, { status: 500 });
  }
}
