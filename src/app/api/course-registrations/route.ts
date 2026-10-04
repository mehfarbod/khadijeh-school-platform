import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";
import { requireStudent } from "@/lib/auth/student-session";
import { rateLimit } from "@/lib/security/rate-limit";
import { getCurrentStudentGrade } from "@/lib/student-current-grade";

const publicRegistrationSchema = z
  .object({
    courseSlug: z.string().trim().min(1).max(200),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

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
    const limit = rateLimit(request as import("next/server").NextRequest, "public:course-registration", { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "تعداد درخواست‌های ثبت‌نام بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const student = await requireStudent();
    const parsed = publicRegistrationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "اطلاعات درخواست ثبت‌نام معتبر نیست." },
        { status: 400 },
      );
    }

    const grade = getCurrentStudentGrade(student.enrollments);
    if (!grade) {
      return NextResponse.json(
        { error: "ثبت‌نام تحصیلی فعالی برای سال جاری پیدا نشد." },
        { status: 422 },
      );
    }

    const { courseSlug, notes } = parsed.data;

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      select: {
        id: true,
        title: true,
        isActive: true,
        status: true,
        gradeLevel: true,
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
      course.gradeLevel &&
      course.gradeLevel !== "all" &&
      course.gradeLevel !== grade
    ) {
      return NextResponse.json(
        { error: "این دوره برای پایه تحصیلی شما ارائه نشده است." },
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

    const existingRegistration = await prisma.courseRegistration.findFirst({
      where: { courseId: course.id, studentId: student.id },
      select: { id: true },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "شما قبلاً برای این دوره ثبت‌نام کرده‌اید." },
        { status: 409 },
      );
    }

    const registration = await prisma.courseRegistration.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        grade,
        notes: notes || null,
      },
      select: {
        id: true,
        status: true,
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
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "برای ثبت‌نام در دوره، ابتدا وارد حساب دانش‌آموزی خود شوید." },
        { status: 401 },
      );
    }

    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "شما قبلاً برای این دوره ثبت‌نام کرده‌اید." },
        { status: 409 },
      );
    }

    console.error("POST /api/course-registrations error:", error);

    return NextResponse.json(
      { error: "ثبت درخواست ثبت‌نام انجام نشد." },
      { status: 500 },
    );
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
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


export async function DELETE(request: Request) {
  try {
    await requirePermission("registrations.manage");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "شناسه ثبت‌نام الزامی است." }, { status: 400 });
    }

    const registration = await prisma.courseRegistration.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "ثبت‌نام پیدا نشد." }, { status: 404 });
    }

    await prisma.courseRegistration.delete({ where: { id } });

    return NextResponse.json({ message: "ثبت‌نام با موفقیت حذف شد." });
  } catch (error) {
    console.error("DELETE /api/course-registrations error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز حذف ثبت‌نام‌ها را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "حذف ثبت‌نام انجام نشد." }, { status: 500 });
  }
}
