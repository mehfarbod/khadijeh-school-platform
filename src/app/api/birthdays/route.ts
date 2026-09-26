import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createBirthdaySchema = z.object({
  firstName: z.string().trim().min(1, "نام الزامی است.").max(100),
  grade: z.string().trim().min(1, "پایه تحصیلی الزامی است.").max(50),
  birthday: z.string().trim().min(1, "تاریخ تولد الزامی است.").max(20),
  photo: z.string().trim().max(2000).nullable().optional(),
  isVisible: z.boolean().optional(),
});

function isTodayBirthday(value: Date | null) {
  if (!value) return false;
  const now = new Date();
  return value.getMonth() === now.getMonth() && value.getDate() === now.getDate();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const [students, manual] = await Promise.all([
      prisma.student.findMany({
        where: {
          isActive: true,
          isBirthdayVisible: true,
          birthday: { not: null },
        },
        include: {
          enrollments: {
            orderBy: { academicYear: { title: "desc" } },
            take: 1,
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      }),
      prisma.birthday.findMany({
        where: activeOnly ? { isVisible: true } : undefined,
        orderBy: { birthday: "asc" },
      }),
    ]);

    const studentBirthdays = students
      .filter((student) => !activeOnly || isTodayBirthday(student.birthday))
      .map((student) => ({
        id: student.id,
        type: "student" as const,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.enrollments[0]?.grade ?? "—",
        birthday: student.birthday,
        photo: student.photo,
        isVisible: student.isBirthdayVisible,
      }));

    const manualBirthdays = manual
      .filter((item) => !activeOnly || isTodayBirthday(
        item.birthday ? new Date(item.birthday) : null,
      ))
      .map((item) => ({
        id: item.id,
        type: "manual" as const,
        firstName: item.firstName,
        lastName: "",
        grade: item.grade,
        birthday: item.birthday,
        photo: item.photo,
        isVisible: item.isVisible,
      }));

    return NextResponse.json([...studentBirthdays, ...manualBirthdays]);
  } catch (error) {
    console.error("GET /api/birthdays error:", error);
    return NextResponse.json({ error: "خطا در دریافت تولدها" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const result = createBirthdaySchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "اطلاعات واردشده معتبر نیست.", details: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = result.data;
    const birthday = await prisma.birthday.create({
      data: {
        firstName: data.firstName,
        grade: data.grade,
        birthday: data.birthday,
        photo: data.photo || null,
        isVisible: data.isVisible ?? true,
      },
    });

    return NextResponse.json(birthday, { status: 201 });
  } catch (error) {
    console.error("POST /api/birthdays error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED")
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN")
      return NextResponse.json({ error: "شما مجوز انجام این عملیات را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "خطا در ایجاد تولد" }, { status: 500 });
  }
}
