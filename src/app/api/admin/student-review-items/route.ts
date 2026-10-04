import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";
import { studentReviewItemSchema } from "@/lib/validation/student-review-item";

export async function GET() {
  try {
    await requirePermission("students.edit");

    const items = await prisma.studentReviewItem.findMany({
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ isVisible: "desc" }, { occurredAt: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت این موارد را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "خطا در دریافت موارد نیازمند بررسی." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("students.edit");

    const result = studentReviewItemSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "اطلاعات واردشده معتبر نیست.", details: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = result.data;
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "دانش‌آموز موردنظر پیدا نشد." }, { status: 404 });
    }

    const item = await prisma.studentReviewItem.create({
      data: {
        studentId: data.studentId,
        type: data.type,
        title: data.title,
        description: data.description || null,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : null,
        status: data.status,
        isVisible: data.isVisible,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت این موارد را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "خطا در ثبت مورد." }, { status: 500 });
  }
}
