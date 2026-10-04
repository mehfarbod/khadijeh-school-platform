import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/student-session";

export async function GET() {
  try {
    const student = await requireStudent();

    const items = await prisma.studentReviewItem.findMany({
      where: {
        studentId: student.id,
        isVisible: true,
      },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        occurredAt: true,
        status: true,
      },
      orderBy: [
        { occurredAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    return NextResponse.json({ error: "خطا در دریافت موارد نیازمند بررسی." }, { status: 500 });
  }
}
