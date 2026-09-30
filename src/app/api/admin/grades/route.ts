import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const gradeSchema = z.object({
  studentId: z.string().min(1),
  academicYearId: z.string().min(1),
  subject: z.string().trim().min(1).max(100),
  term: z.string().trim().min(1).max(50),
  score: z.coerce.number().min(0).max(20),
  description: z.string().trim().max(500).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId") || undefined;
    const grade = searchParams.get("grade") || undefined;
    const className = searchParams.get("className") || undefined;
    const studentId = searchParams.get("studentId") || undefined;

    const academicYears = await prisma.academicYear.findMany({
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }, { title: "desc" }],
    });

    const students = await prisma.student.findMany({
      where: {
        isActive: true,
        ...(studentId ? { id: studentId } : {}),
        ...(academicYearId || grade || className
          ? {
              enrollments: {
                some: {
                  ...(academicYearId ? { academicYearId } : {}),
                  ...(grade ? { grade } : {}),
                  ...(className ? { className } : {}),
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        enrollments: {
          where: academicYearId ? { academicYearId } : undefined,
          select: { grade: true, className: true, academicYearId: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const grades = academicYearId || studentId ? await prisma.studentGrade.findMany({
      where: {
        ...(academicYearId ? { academicYearId } : {}),
        ...(studentId ? { studentId } : {}),
      },
      select: {
        id: true,
        studentId: true,
        academicYearId: true,
        subject: true,
        term: true,
        score: true,
        description: true,
      },
      orderBy: [{ subject: "asc" }, { term: "asc" }],
    }) : [];

    return NextResponse.json({
      academicYears,
      students,
      grades: grades.map((item) => ({ ...item, score: item.score.toString() })),
    });
  } catch (error) {
    console.error("GET /api/admin/grades error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز دسترسی به نمرات را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "خطا در دریافت اطلاعات نمرات." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "شناسه نمره الزامی است." }, { status: 400 });
    }

    const existing = await prisma.studentGrade.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "نمره موردنظر پیدا نشد." }, { status: 404 });
    }

    await prisma.studentGrade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/grades error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز حذف نمرات را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "حذف نمره انجام نشد." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const parsed = gradeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "اطلاعات نمره معتبر نیست." }, { status: 400 });
    }

    const data = parsed.data;
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: {
        studentId_academicYearId: {
          studentId: data.studentId,
          academicYearId: data.academicYearId,
        },
      },
      select: { id: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "این دانش‌آموز در سال تحصیلی انتخاب‌شده ثبت نشده است." },
        { status: 400 },
      );
    }

    const grade = await prisma.studentGrade.upsert({
      where: {
        studentId_academicYearId_subject_term: {
          studentId: data.studentId,
          academicYearId: data.academicYearId,
          subject: data.subject,
          term: data.term,
        },
      },
      create: {
        ...data,
        score: data.score,
        teacherId: session.user.id,
        description: data.description || null,
      },
      update: {
        score: data.score,
        description: data.description || null,
        teacherId: session.user.id,
      },
    });

    return NextResponse.json({
      ...grade,
      score: grade.score.toString(),
    });
  } catch (error) {
    console.error("POST /api/admin/grades error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز ثبت نمره را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "ثبت نمره انجام نشد." }, { status: 500 });
  }
}
