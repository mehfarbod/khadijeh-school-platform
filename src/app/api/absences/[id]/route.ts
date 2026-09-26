import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(50),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    const { id } = await context.params;
    const result = schema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json({ error: "اطلاعات واردشده معتبر نیست." }, { status: 400 });
    }

    const absence = await prisma.dailyAbsence.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(absence);
  } catch (error) {
    console.error("PATCH /api/absences/[id] error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json({ error: "شما مجوز انجام این عملیات را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در ویرایش غیبت" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    const { id } = await context.params;
    await prisma.dailyAbsence.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/absences/[id] error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json({ error: "شما مجوز انجام این عملیات را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در حذف غیبت" }, { status: 500 });
  }
}
