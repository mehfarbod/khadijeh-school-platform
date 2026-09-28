import { prisma } from "@/lib/prisma";

export const EDUCATIONAL_PROGRAM_DEFAULTS = [
  { type: "weekly", title: "برنامه هفتگی", description: "برنامه هفتگی کلاس‌ها و دروس مدرسه." },
  { type: "exams", title: "برنامه امتحانات", description: "زمان‌بندی امتحانات و ارزیابی‌های مدرسه." },
  { type: "calendar", title: "تقویم آموزشی", description: "رویدادها و برنامه‌های مهم آموزشی." },
  { type: "parents-meetings", title: "جلسات انجمن اولیا و مربیان", description: "اطلاعات جلسات و برنامه‌های انجمن اولیا و مربیان." },
  { type: "family-counseling", title: "جلسات مشاوره خانواده", description: "برنامه جلسات مشاوره و راهنمایی خانواده‌ها." },
] as const;

export async function ensureEducationalProgram(type: string) {
  const item = EDUCATIONAL_PROGRAM_DEFAULTS.find((program) => program.type === type);
  if (!item) return null;

  return prisma.educationalProgram.upsert({
    where: { type: item.type },
    create: { ...item, isActive: true },
    update: {},
  });
}

export async function ensureAllEducationalPrograms() {
  await prisma.$transaction(
    EDUCATIONAL_PROGRAM_DEFAULTS.map((item) =>
      prisma.educationalProgram.upsert({
        where: { type: item.type },
        create: { ...item, isActive: true },
        update: {},
      }),
    ),
  );
}
