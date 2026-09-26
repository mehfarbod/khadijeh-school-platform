import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.schoolSettings.findUnique({
      where: { id: "school-settings" },
      select: {
        schoolName: true,
        heroTitle: true,
        heroDescription: true,
        footerTitle: true,
        footerDescription: true,
        phone: true,
        mobile: true,
        email: true,
        address: true,
        workingHours: true,
        mapUrl: true,
        namAddressUrl: true,
        instagramUrl: true,
        telegramUrl: true,
        whatsappUrl: true,
        eitaaUrl: true,
        baleUrl: true,
        skyroomUrl: true,
        showNews: true,
        showEvents: true,
        showBirthdays: true,
        showTopStudents: true,
        showDailyAbsences: true,
      },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "خطا در دریافت تنظیمات" }, { status: 500 });
  }
}
