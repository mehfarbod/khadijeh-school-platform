import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";
import { studentReviewItemSchema } from "@/lib/validation/student-review-item";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("students.edit");
    const { id } = await context.params;
    const result = studentReviewItemSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json({ error: "اطلاعات واردشده معتبر نیست." }, { status: 400 });
    }

    const data = result.data;
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "دانش‌آموز موردنظر پیدا نشد." },
        { status: 404 },
      );
    }

    const item = await prisma.studentReviewItem.update({
      where: { id },
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

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت این موارد را ندارید." }, { status: 403 });
    }
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "مورد درخواستی پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ error: "خطا در ویرایش مورد." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    await requirePermission("students.edit");
    const { id } = await context.params;
    await prisma.studentReviewItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت این موارد را ندارید." }, { status: 403 });
    }
    if (isPrismaNotFoundError(error)) {
      return NextResponse.json({ error: "مورد درخواستی پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ error: "خطا در حذف مورد." }, { status: 500 });
  }
}

function isPrismaNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
