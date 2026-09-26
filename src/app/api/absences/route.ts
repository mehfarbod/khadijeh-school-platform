import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const todayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const absenceSchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است.").max(100),
  lastName: z.string().trim().min(1, "نام خانوادگی الزامی است.").max(100),
  grade: z.string().trim().min(1, "پایه الزامی است.").max(50),
});

async function cleanupOldAbsences() {
  await prisma.dailyAbsence.deleteMany({
    where: { dateKey: { not: todayKey() } },
  });
}

export async function GET(request: NextRequest) {
  try {
    await cleanupOldAbsences();
    const activeOnly = new URL(request.url).searchParams.get("activeOnly") !== "false";
    const absences = await prisma.dailyAbsence.findMany({
      where: activeOnly ? { dateKey: todayKey() } : undefined,
      orderBy: [{ grade: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    });
    return NextResponse.json(absences);
  } catch (error) {
    console.error("GET /api/absences error:", error);
    return NextResponse.json({ error: "خطا در دریافت غیبت‌ها" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await cleanupOldAbsences();
    const result = absenceSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "اطلاعات واردشده معتبر نیست.", details: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const absence = await prisma.dailyAbsence.create({
      data: { ...result.data, dateKey: todayKey() },
    });

    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    console.error("POST /api/absences error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json({ error: "شما مجوز انجام این عملیات را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در ثبت غیبت" }, { status: 500 });
  }
}
