import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const [
      studentCount,
      staffCount,
      courseCount,
      eventCount,
      announcementCount,
      unreadMessages,
      birthdays,
    ] = await Promise.all([
      prisma.student.count({
        where: { isActive: true },
      }),

      prisma.staff.count(),

      prisma.course.count({
        where: { isActive: true },
      }),

      prisma.event.count(),

      prisma.announcement.count({
        where: { isActive: true },
      }),

      prisma.contactMessage.count({
        where: { isRead: false },
      }),

      prisma.birthday.findMany({
        where: {
          isVisible: true,
        },
        select: {
          birthday: true,
        },
      }),
    ]);

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayBirthday = `${month}-${day}`;

    const todayBirthdays = birthdays.filter(
      (birthday) => birthday.birthday === todayBirthday
    ).length;

    return NextResponse.json({
      studentCount,
      staffCount,
      courseCount,
      eventCount,
      announcementCount,
      unreadMessages,
      todayBirthdays,
    });
  } catch (error) {
    console.error("GET /api/overview error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز مشاهده داشبورد را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات داشبورد" },
      { status: 500 }
    );
  }
}