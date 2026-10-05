import { NextRequest, NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { gradeSchema } from "@/lib/validation/student";

const gradeOrder = ["10", "11", "12"];
const legacyGradeValues: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

export async function GET(request: NextRequest) {
  try {
    await requirePermission("students.edit");

    const academicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    });

    if (!academicYear) {
      return NextResponse.json({ grades: [], classes: [], students: [] });
    }

    const { searchParams } = new URL(request.url);
    const rawGrade = searchParams.get("grade");
    const className = searchParams.get("className")?.trim();
    const parsedGrade = rawGrade ? gradeSchema.safeParse(rawGrade) : null;

    if (parsedGrade && !parsedGrade.success) {
      return NextResponse.json({ error: "پایه تحصیلی معتبر نیست." }, { status: 400 });
    }

    const grade = parsedGrade?.success ? parsedGrade.data : undefined;
    const gradeRows = await prisma.studentEnrollment.findMany({
      where: {
        academicYearId: academicYear.id,
        student: { isActive: true },
      },
      select: { grade: true },
      distinct: ["grade"],
    });
    const grades = [...new Set(gradeRows
      .flatMap((row) => {
        const parsed = gradeSchema.safeParse(row.grade);
        return parsed.success ? [parsed.data] : [];
      }))]
      .sort((first, second) => gradeOrder.indexOf(first) - gradeOrder.indexOf(second));

    if (!grade) {
      return NextResponse.json({ grades, classes: [], students: [] });
    }

    const classRows = await prisma.studentEnrollment.findMany({
      where: {
        academicYearId: academicYear.id,
        grade: { in: [grade, legacyGradeValues[grade]] },
        className: { not: null },
        student: { isActive: true },
      },
      select: { className: true },
      distinct: ["className"],
      orderBy: { className: "asc" },
    });
    const classes = classRows.flatMap((row) => row.className ? [row.className] : []);

    if (!className) {
      return NextResponse.json({ grades, classes, students: [] });
    }

    if (!classes.includes(className)) {
      return NextResponse.json({ error: "کلاس انتخاب‌شده متعلق به این پایه نیست." }, { status: 400 });
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        academicYearId: academicYear.id,
        grade: { in: [grade, legacyGradeValues[grade]] },
        className,
        student: { isActive: true },
      },
      select: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
    });

    return NextResponse.json({
      grades,
      classes,
      students: enrollments.map(({ student }) => student),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز مدیریت این موارد را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ error: "خطا در دریافت گزینه‌های دانش‌آموزان." }, { status: 500 });
  }
}
