import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/authorization";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 },
      );
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

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
      prisma.staff.count({
        where: { isActive: true },
      }),
      prisma.course.count({
        where: { isActive: true },
      }),
      prisma.event.count({
        where: { isActive: true },
      }),
      prisma.announcement.count({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: "" },
            { expiresAt: { gt: now.toISOString() } },
          ],
        },
      }),
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
      prisma.birthday.findMany({
        where: { isVisible: true },
        select: { birthday: true },
      }),
    ]);

    const todayBirthdays = birthdays.filter((item) => {
      const birthday = item.birthday.trim();

      if (!birthday) {
        return false;
      }

      const parts = birthday.split(/[/-]/).map(Number);

      if (parts.length < 2 || parts.some(Number.isNaN)) {
        return false;
      }

      const [, month, day] =
        parts.length >= 3 ? parts : [0, parts[0], parts[1]];

      return month === now.getMonth() + 1 && day === now.getDate();
    }).length;

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
    console.error("GET /api/admin/overview error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات داشبورد." },
      { status: 500 },
    );
  }
}
