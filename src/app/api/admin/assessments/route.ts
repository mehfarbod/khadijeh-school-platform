import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const assessmentSchema = z.object({
  studentId: z.string().min(1),
  academicYearId: z.string().min(1),
  subject: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50).default("هفتگی"),
  title: z.string().trim().min(1).max(150),
  assessmentDate: z.string().optional().nullable(),
  score: z.coerce.number().min(0).max(20),
  description: z.string().trim().max(500).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || undefined;
    const academicYearId = searchParams.get("academicYearId") || undefined;

    const assessments = await prisma.studentAssessment.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(academicYearId ? { academicYearId } : {}),
      },
      orderBy: [{ assessmentDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      assessments: assessments.map((item) => ({
        ...item,
        score: item.score.toString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/assessments error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز دسترسی به ارزیابی‌ها را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "خطا در دریافت ارزیابی‌ها." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const parsed = assessmentSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: "اطلاعات ارزیابی معتبر نیست." }, { status: 400 });
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
      return NextResponse.json({ error: "این دانش‌آموز در سال تحصیلی انتخاب‌شده ثبت نشده است." }, { status: 400 });
    }

    const assessment = await prisma.studentAssessment.create({
      data: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        subject: data.subject,
        type: data.type,
        title: data.title,
        assessmentDate: data.assessmentDate ? new Date(data.assessmentDate) : null,
        score: data.score,
        teacherId: session.user.id,
        description: data.description || null,
      },
    });

    return NextResponse.json({
      ...assessment,
      score: assessment.score.toString(),
    });
  } catch (error) {
    console.error("POST /api/admin/assessments error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز ثبت ارزیابی را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "ثبت ارزیابی انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه ارزیابی الزامی است." }, { status: 400 });

    await prisma.studentAssessment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/assessments error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز حذف ارزیابی‌ها را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "حذف ارزیابی انجام نشد." }, { status: 500 });
  }
}
