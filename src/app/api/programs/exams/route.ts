import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const entrySchema = z.object({
  subject: z.string().trim().min(1).max(100),
  date: z.string().trim().min(1).max(30),
  time: z.string().trim().max(20).optional(),
  grade: z.string().trim().min(1).max(50),
  className: z.string().trim().max(100).optional(),
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
    const grade = params.get("grade");

    const program = await prisma.educationalProgram.findUnique({
      where: { type: "exams" },
      include: { examSchedule: { include: { entries: { orderBy: { date: "asc" } } } } },
    });

    if (!program) return NextResponse.json({ error: "برنامه امتحانات یافت نشد." }, { status: 404 });
    if (activeOnly && (!program.isActive || !program.examSchedule?.isActive)) {
      return NextResponse.json({ program, schedule: null });
    }

    const schedule = program.examSchedule
      ? { ...program.examSchedule, entries: grade ? program.examSchedule.entries.filter((e) => e.grade === grade) : program.examSchedule.entries }
      : null;

    return NextResponse.json({ program, schedule });
  } catch (error) {
    console.error("GET /api/programs/exams error:", error);
    return NextResponse.json({ error: "خطا در دریافت برنامه امتحانات." }, { status: 500 });
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
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات برنامه امتحانات معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const program = await prisma.educationalProgram.findUnique({ where: { type: "exams" } });
    if (!program) return NextResponse.json({ error: "تعریف برنامه امتحانات پیدا نشد." }, { status: 404 });

    const schedule = await prisma.$transaction(async (tx) => {
      const saved = await tx.examSchedule.upsert({
        where: { programId: program.id },
        create: { programId: program.id, imageUrl: parsed.data.imageUrl || null, isActive: parsed.data.isActive },
        update: { imageUrl: parsed.data.imageUrl || null, isActive: parsed.data.isActive },
      });

      await tx.examScheduleEntry.deleteMany({ where: { scheduleId: saved.id } });
      if (parsed.data.entries.length) {
        await tx.examScheduleEntry.createMany({
          data: parsed.data.entries.map((entry) => ({ ...entry, scheduleId: saved.id })),
        });
      }

      return tx.examSchedule.findUnique({ where: { id: saved.id }, include: { entries: true } });
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("SAVE /api/programs/exams error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت برنامه‌های آموزشی را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ذخیره برنامه امتحانات با خطا مواجه شد." }, { status: 500 });
  }
}
