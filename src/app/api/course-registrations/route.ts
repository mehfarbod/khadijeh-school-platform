import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, requirePermission } from "@/lib/auth/authorization";

const normalizeDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));

export async function GET(request: Request) {
  try {
    await requirePermission("registrations.view");

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const registrations = await prisma.courseRegistration.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/course-registrations error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مشاهده ثبت‌نام‌ها را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "خطا در دریافت ثبت‌نام‌ها" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug.trim() : "";
    const studentFirstName =
      typeof body.studentFirstName === "string" ? body.studentFirstName.trim() : "";
    const studentLastName =
      typeof body.studentLastName === "string" ? body.studentLastName.trim() : "";
    const grade = typeof body.grade === "string" ? body.grade.trim() : "";
    const phone =
      typeof body.phone === "string"
        ? normalizeDigits(body.phone).replace(/[\s-]/g, "")
        : "";
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null;

    if (!courseSlug || !studentFirstName || !studentLastName || !grade || !phone) {
      return NextResponse.json(
        { error: "اطلاعات ضروری ثبت‌نام کامل نیست." },
        { status: 400 },
      );
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره تلفن همراه معتبر نیست." },
        { status: 400 },
      );
    }

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        title: true,
        isActive: true,
        status: true,
        capacity: true,
        registrationDeadline: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!course || !course.isActive) {
      return NextResponse.json({ error: "دوره موردنظر پیدا نشد." }, { status: 404 });
    }

    if (course.status !== "active") {
      return NextResponse.json(
        { error: "ثبت‌نام این دوره در حال حاضر فعال نیست." },
        { status: 400 },
      );
    }

    if (
      course.registrationDeadline &&
      course.registrationDeadline.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "مهلت ثبت‌نام این دوره به پایان رسیده است." },
        { status: 400 },
      );
    }

    if (course._count.registrations >= course.capacity) {
      return NextResponse.json(
        { error: "ظرفیت این دوره تکمیل شده است." },
        { status: 400 },
      );
    }

    const registration = await prisma.courseRegistration.create({
      data: {
        courseId: course.id,
        studentFirstName,
        studentLastName,
        grade,
        notes,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("POST /api/course-registrations error:", error);

    return NextResponse.json(
      { error: "ثبت درخواست ثبت‌نام انجام نشد." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requirePermission("registrations.manage");

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!id || !["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "اطلاعات عملیات معتبر نیست." }, { status: 400 });
    }

    const registration = await prisma.courseRegistration.update({
      where: { id },
      data: { status: status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("PATCH /api/course-registrations error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت ثبت‌نام‌ها را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "عملیات ثبت‌نام انجام نشد." }, { status: 500 });
  }
}
