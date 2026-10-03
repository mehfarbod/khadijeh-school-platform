import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

type Context = { params: Promise<{ id: string }> };

const itemSchema = z.object({
  studentId: z.string().trim().min(1),
  type: z.enum(["ABSENCE", "DISCIPLINE", "GENERAL"]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(3000).nullable().optional(),
  occurredAt: z.string().datetime().nullable().optional(),
  status: z.enum(["OPEN", "REVIEWED", "RESOLVED"]),
  isVisible: z.boolean(),
});

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await requirePermission("students.edit");
    const { id } = await context.params;
    const result = itemSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json({ error: "اطلاعات واردشده معتبر نیست." }, { status: 400 });
    }

    const data = result.data;
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
    return NextResponse.json({ error: "خطا در حذف مورد." }, { status: 500 });
  }
}
