import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const academicYearSchema = z.object({
  title: z.string().trim().min(1, "عنوان سال تحصیلی الزامی است."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const academicYears = await prisma.academicYear.findMany({
      orderBy: { title: "desc" },
    });

    return NextResponse.json(academicYears);
  } catch (error) {
    console.error("GET /api/academic-years error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت سال‌های تحصیلی." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();

    const result = academicYearSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "اطلاعات واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { title, startDate, endDate, isCurrent } = result.data;

    const existingYear = await prisma.academicYear.findUnique({
      where: { title },
    });

    if (existingYear) {
      return NextResponse.json(
        { error: "این سال تحصیلی قبلاً ثبت شده است." },
        { status: 409 },
      );
    }

    if (isCurrent) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        title,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
      },
    });

    return NextResponse.json(academicYear, { status: 201 });
  } catch (error) {
    console.error("POST /api/academic-years error:", error);

    return NextResponse.json(
      { error: "خطا در ایجاد سال تحصیلی." },
      { status: 500 },
    );
  }
}
