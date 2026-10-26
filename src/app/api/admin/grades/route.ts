import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { assertTeacherCanAccessStudent, getTeacherClassIds } from "@/lib/auth/teacher-access";

const gradeSchema = z.object({
  studentId: z.string().min(1),
  academicYearId: z.string().min(1),
  subject: z.string().trim().min(1).max(100),
  term: z.enum(["مستمر نوبت اول", "نوبت اول", "مستمر نوبت دوم", "نوبت دوم"]),
  score: z.coerce.number().min(0).max(20),
  description: z.string().trim().max(500).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId") || undefined;
    const grade = searchParams.get("grade") || undefined;
    const className = searchParams.get("className") || undefined;
    const studentId = searchParams.get("studentId") || undefined;

    const teacherClassIds = session.user.role === "TEACHER"
      ? await getTeacherClassIds(session.user.id, academicYearId)
      : null;

    if (session.user.role === "TEACHER" && teacherClassIds?.length === 0) {
      return NextResponse.json({ academicYears: await prisma.academicYear.findMany({ orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }, { title: "desc" }] }), students: [], grades: [] });
    }

    const academicYears = await prisma.academicYear.findMany({
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }, { title: "desc" }],
    });

    const students = await prisma.student.findMany({
      where: {
        isActive: true,
        ...(studentId ? { id: studentId } : {}),
        ...(academicYearId || grade || className || teacherClassIds
          ? { enrollments: { some: {
              ...(academicYearId ? { academicYearId } : {}),
              ...(grade ? { grade } : {}),
              ...(className ? { className } : {}),
              ...(teacherClassIds ? { classId: { in: teacherClassIds } } : {}),
            } } }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        enrollments: {
          where: academicYearId ? { academicYearId } : undefined,
          select: { grade: true, className: true, classId: true, academicYearId: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    let grades = [] as Awaited<ReturnType<typeof prisma.studentGrade.findMany>>;
    if (academicYearId || studentId) {
      const teacherSubjectScope = session.user.role === "TEACHER"
        ? (await prisma.teacherClassAssignment.findMany({
            where: {
              teacherId: session.user.id,
              class: { isActive: true, ...(academicYearId ? { academicYearId } : {}) },
            },
            select: { classId: true, subject: true },
          }))
        : [];

      grades = await prisma.studentGrade.findMany({
        where: {
          ...(academicYearId ? { academicYearId } : {}),
          ...(studentId ? { studentId } : {}),
          ...(teacherClassIds
            ? {
                OR: teacherSubjectScope.map((assignment) => ({
                  ...(assignment.subject?.trim()
                    ? { subject: assignment.subject.trim() }
                    : {}),
                  student: {
                    enrollments: {
                      some: {
                        ...(academicYearId ? { academicYearId } : {}),
                        classId: assignment.classId,
                      },
                    },
                  },
                })),
              }
            : {}),
        },
        select: { id: true, studentId: true, academicYearId: true, subject: true, term: true, score: true, description: true },
        orderBy: [{ subject: "asc" }, { term: "asc" }],
      });
    }

    return NextResponse.json({ academicYears, students, grades: grades.map((item) => ({ ...item, score: item.score.toString() })) });
  } catch (error) {
    console.error("GET /api/admin/grades error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز دسترسی به نمرات را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در دریافت اطلاعات نمرات." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه نمره الزامی است." }, { status: 400 });

    const existing = await prisma.studentGrade.findUnique({ where: { id }, select: { id: true, studentId: true, academicYearId: true, subject: true } });
    if (!existing) return NextResponse.json({ error: "نمره موردنظر پیدا نشد." }, { status: 404 });

    if (session.user.role === "TEACHER") {
      await assertTeacherCanAccessStudent({ teacherId: session.user.id, studentId: existing.studentId, academicYearId: existing.academicYearId, subject: existing.subject });
    }

    await prisma.studentGrade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/grades error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز حذف نمرات را ندارید." }, { status: 403 });
    if (error instanceof Error && error.message === "TEACHER_CLASS_FORBIDDEN") return NextResponse.json({ error: "این دانش‌آموز در یکی از کلاس‌های شما نیست." }, { status: 403 });
    return NextResponse.json({ error: "حذف نمره انجام نشد." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const parsed = gradeSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات نمره معتبر نیست." }, { status: 400 });

    const data = parsed.data;
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { studentId_academicYearId: { studentId: data.studentId, academicYearId: data.academicYearId } },
      select: { id: true },
    });
    if (!enrollment) return NextResponse.json({ error: "این دانش‌آموز در سال تحصیلی انتخاب‌شده ثبت نشده است." }, { status: 400 });

    if (session.user.role === "TEACHER") {
      await assertTeacherCanAccessStudent({ teacherId: session.user.id, studentId: data.studentId, academicYearId: data.academicYearId, subject: data.subject });
    }

    const grade = await prisma.studentGrade.upsert({
      where: { studentId_academicYearId_subject_term: { studentId: data.studentId, academicYearId: data.academicYearId, subject: data.subject, term: data.term } },
      create: { ...data, teacherId: session.user.id, description: data.description || null },
      update: { score: data.score, description: data.description || null, teacherId: session.user.id },
    });

    return NextResponse.json({ ...grade, score: grade.score.toString() });
  } catch (error) {
    console.error("POST /api/admin/grades error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز ثبت نمره را ندارید." }, { status: 403 });
    if (error instanceof Error && error.message === "TEACHER_CLASS_FORBIDDEN") return NextResponse.json({ error: "این دانش‌آموز در یکی از کلاس‌های شما نیست." }, { status: 403 });
    return NextResponse.json({ error: "ثبت نمره انجام نشد." }, { status: 500 });
  }
}
