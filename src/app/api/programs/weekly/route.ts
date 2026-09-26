import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const entrySchema = z.object({
  className: z.string().trim().min(1).max(100),
  day: z.string().trim().min(1).max(30),
  startTime: z.string().trim().min(1).max(20),
  endTime: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(1).max(100),
  teacher: z.string().trim().max(150).optional(),
});

const schema = z.object({
  imageUrl: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
  entries: z.array(entrySchema).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const activeOnly = params.get("activeOnly") !== "false";
    const className = params.get("className");

    const program = await prisma.educationalProgram.findUnique({
      where: { type: "weekly" },
      include: {
        weeklySchedule: {
          include: { entries: { orderBy: [{ className: "asc" }, { day: "asc" }, { startTime: "asc" }] } },
        },
      },
    });

    if (!program) return NextResponse.json({ error: "برنامه هفتگی یافت نشد." }, { status: 404 });
    if (activeOnly && (!program.isActive || !program.weeklySchedule?.isActive)) {
      return NextResponse.json({ program, schedule: null });
    }

    const schedule = program.weeklySchedule
      ? { ...program.weeklySchedule, entries: className ? program.weeklySchedule.entries.filter((e) => e.className === className) : program.weeklySchedule.entries }
      : null;

    return NextResponse.json({ program, schedule });
  } catch (error) {
    console.error("GET /api/programs/weekly error:", error);
    return NextResponse.json({ error: "خطا در دریافت برنامه هفتگی." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return save(request);
}

export async function PATCH(request: NextRequest) {
  return save(request);
}

async function save(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات برنامه هفتگی معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const program = await prisma.educationalProgram.findUnique({ where: { type: "weekly" } });
    if (!program) return NextResponse.json({ error: "تعریف برنامه هفتگی پیدا نشد." }, { status: 404 });

    const schedule = await prisma.$transaction(async (tx) => {
      const saved = await tx.weeklySchedule.upsert({
        where: { programId: program.id },
        create: { programId: program.id, imageUrl: parsed.data.imageUrl || null, isActive: parsed.data.isActive },
        update: { imageUrl: parsed.data.imageUrl || null, isActive: parsed.data.isActive },
      });

      await tx.weeklyScheduleEntry.deleteMany({ where: { scheduleId: saved.id } });
      if (parsed.data.entries.length) {
        await tx.weeklyScheduleEntry.createMany({
          data: parsed.data.entries.map((entry) => ({ ...entry, scheduleId: saved.id })),
        });
      }

      return tx.weeklySchedule.findUnique({ where: { id: saved.id }, include: { entries: true } });
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("SAVE /api/programs/weekly error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ذخیره برنامه هفتگی با خطا مواجه شد." }, { status: 500 });
  }
}
