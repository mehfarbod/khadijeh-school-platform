import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const SETTINGS_ID = "school-settings";

const schema = z.object({
  schoolName: z.string().min(1).max(200),
  heroTitle: z.string().min(1).max(300),
  heroDescription: z.string().min(1).max(1000),
  footerTitle: z.string().min(1).max(200),
  footerDescription: z.string().min(1).max(1000),
  officialName: z.string().max(200).nullable().optional(),
  slogan: z.string().max(300).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  mobile: z.string().max(50).nullable().optional(),
  email: z.string().email().max(200).nullable().or(z.literal("")).optional(),
  address: z.string().max(500).nullable().optional(),
  postalCode: z.string().max(30).nullable().optional(),
  workingHours: z.string().max(300).nullable().optional(),
  logoUrl: z.string().max(500).nullable().optional(),
  faviconUrl: z.string().max(500).nullable().optional(),
  siteTitle: z.string().max(200).nullable().optional(),
  siteDescription: z.string().max(500).nullable().optional(),
  footerText: z.string().max(500).nullable().optional(),
  instagramUrl: z.string().max(500).nullable().optional(),
  telegramUrl: z.string().max(500).nullable().optional(),
  whatsappUrl: z.string().max(500).nullable().optional(),
  mapUrl: z.string().max(1000).nullable().optional(),
  namAddressUrl: z.string().max(1000).nullable().optional(),
  eitaaUrl: z.string().max(500).nullable().optional(),
  baleUrl: z.string().max(500).nullable().optional(),
  skyroomUrl: z.string().max(500).nullable().optional(),
  schoolStatusEnabled: z.boolean(),
  schoolStatus: z.string().max(200).nullable().optional(),
  showNews: z.boolean(),
  showEvents: z.boolean(),
  showBirthdays: z.boolean(),
  showTopStudents: z.boolean(),
  showDailyAbsences: z.boolean(),
});

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export async function GET() {
  try {
    await requirePermission("settings.manage");

    const settings = await prisma.schoolSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: {
        id: SETTINGS_ID,
        schoolName: "دبیرستان شاهد حضرت خدیجه (س)",
        heroTitle: "دبیرستان دخترانه شاهد حضرت خدیجه (س)",
        heroDescription: "محیطی امن، پویا و الهام‌بخش برای رشد علمی، اخلاقی و خلاقانه دانش‌آموزان؛ جایی برای یادگیری، تجربه و ساختن آینده‌ای روشن.",
        footerTitle: "شاهد حضرت خدیجه (س)",
        footerDescription: "دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف پرورش استعدادهای علمی و مهارتی دانش‌آموزان.",
        schoolStatusEnabled: false,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در دریافت تنظیمات";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await requirePermission("settings.manage");

    const raw = await request.json();
    const parsed = schema.parse({
      ...raw,
      officialName: emptyToNull(raw.officialName),
      slogan: emptyToNull(raw.slogan),
      phone: emptyToNull(raw.phone),
      mobile: emptyToNull(raw.mobile),
      email: emptyToNull(raw.email),
      address: emptyToNull(raw.address),
      postalCode: emptyToNull(raw.postalCode),
      workingHours: emptyToNull(raw.workingHours),
      logoUrl: emptyToNull(raw.logoUrl),
      faviconUrl: emptyToNull(raw.faviconUrl),
      siteTitle: emptyToNull(raw.siteTitle),
      siteDescription: emptyToNull(raw.siteDescription),
      footerText: emptyToNull(raw.footerText),
      instagramUrl: emptyToNull(raw.instagramUrl),
      telegramUrl: emptyToNull(raw.telegramUrl),
      whatsappUrl: emptyToNull(raw.whatsappUrl),
      mapUrl: emptyToNull(raw.mapUrl),
      namAddressUrl: emptyToNull(raw.namAddressUrl),
      eitaaUrl: emptyToNull(raw.eitaaUrl),
      baleUrl: emptyToNull(raw.baleUrl),
      skyroomUrl: emptyToNull(raw.skyroomUrl),
      schoolStatus: emptyToNull(raw.schoolStatus),
    });

    const settings = await prisma.schoolSettings.upsert({
      where: { id: SETTINGS_ID },
      update: parsed,
      create: { id: SETTINGS_ID, ...parsed },
    });

    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطا در ذخیره تنظیمات";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
