import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireStudent } from "@/lib/auth/student-session";
import { iranianMobileSchema } from "@/lib/validation/student";
import { prisma } from "@/lib/prisma";

const profileSchema = z
  .object({
    mobile: iranianMobileSchema.nullable().optional(),
    fatherMobile: iranianMobileSchema.nullable().optional(),
    motherMobile: iranianMobileSchema.nullable().optional(),
    address: z
      .string()
      .trim()
      .max(1000, "آدرس بیش از حد طولانی است.")
      .nullable()
      .optional(),
    landline: z
      .string()
      .trim()
      .max(30, "شماره تلفن ثابت بیش از حد طولانی است.")
      .nullable()
      .optional(),
    email: z
      .string()
      .trim()
      .email("ایمیل واردشده معتبر نیست.")
      .max(254)
      .nullable()
      .optional(),
  })
  .strict();

export async function PATCH(request: NextRequest) {
  try {
    const student = await requireStudent();
    const result = profileSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "اطلاعات واردشده معتبر نیست.", details: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = result.data;
    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        ...(data.mobile !== undefined ? { mobile: data.mobile || null } : {}),
        ...(data.fatherMobile !== undefined ? { fatherMobile: data.fatherMobile || null } : {}),
        ...(data.motherMobile !== undefined ? { motherMobile: data.motherMobile || null } : {}),
        ...(data.address !== undefined ? { address: data.address || null } : {}),
        ...(data.landline !== undefined ? { landline: data.landline || null } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
      },
      select: {
        mobile: true,
        fatherMobile: true,
        motherMobile: true,
        address: true,
        landline: true,
        email: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    return NextResponse.json({ error: "خطا در ذخیره اطلاعات پروفایل." }, { status: 500 });
  }
}
