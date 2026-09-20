import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const activeOnly = searchParams.get("activeOnly") !== "false";

    const courses = await prisma.course.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = courses.map((course) => ({
      ...course,
      currentRegistrations: course._count.registrations,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/courses error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت دوره‌ها" },
      { status: 500 }
    );
  }
}