import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const registrationSchema = z.object({
  courseId: z.string().min(1),
  studentFirstName: z.string().trim().min(1).max(100),
  studentLastName: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(30),
  guardianName: z.string().trim().min(1).max(150),
  guardianPhone: z.string().trim().min(10).max(20),
  email: z.string().trim().email().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function GET() {
  try {
    await requirePermission("registrations.view");
    const registrations = await prisma.courseRegistration.findMany({
      include: {
        course: { select: { id: true, title: true, slug: true } },
        student: { select: { id: true, firstName: true, lastName: true, nationalId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/course-registrations error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مشاهده ثبت‌نام‌ها را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در دریافت ثبت‌نام‌ها." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات ثبت‌نام معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const data = parsed.data;
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!course || !course.isActive) return NextResponse.json({ error: "این دوره در دسترس نیست." }, { status: 404 });
    if (course.status !== "active") return NextResponse.json({ error: "ثبت‌نام این دوره هنوز فعال نشده است." }, { status: 409 });
    if (course.registrationDeadline && course.registrationDeadline.getTime() < Date.now()) return NextResponse.json({ error: "مهلت ثبت‌نام این دوره به پایان رسیده است." }, { status: 409 });
    if (course._count.registrations >= course.capacity) return NextResponse.json({ error: "ظرفیت این دوره تکمیل شده است." }, { status: 409 });

    const registration = await prisma.courseRegistration.create({
      data: {
        courseId: data.courseId,
        studentFirstName: data.studentFirstName,
        studentLastName: data.studentLastName,
        grade: data.grade,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        email: data.email || null,
        notes: data.notes || null,
      },
      include: { course: { select: { title: true } } },
    });

    return NextResponse.json({ message: "درخواست ثبت‌نام با موفقیت ثبت شد.", registration }, { status: 201 });
  } catch (error) {
    console.error("POST /api/course-registrations error:", error);
    return NextResponse.json({ error: "ثبت درخواست ثبت‌نام با خطا مواجه شد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("registrations.manage");
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const status = body?.status;
    if (!id || !["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "اطلاعات وضعیت معتبر نیست." }, { status: 400 });
    }

    const registration = await prisma.courseRegistration.update({
      where: { id },
      data: { status },
      include: { course: { select: { title: true } } },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("PATCH /api/course-registrations error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت ثبت‌نام‌ها را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "تغییر وضعیت ثبت‌نام با خطا مواجه شد." }, { status: 500 });
  }
}
