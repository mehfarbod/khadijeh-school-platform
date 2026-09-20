import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createContactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "نام الزامی است.")
    .max(150, "نام بیش از حد طولانی است."),

  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است.")
    .max(255, "ایمیل بیش از حد طولانی است."),

  subject: z
    .string()
    .trim()
    .max(300, "موضوع پیام بیش از حد طولانی است.")
    .nullable()
    .optional(),

  message: z
    .string()
    .trim()
    .min(1, "متن پیام الزامی است.")
    .max(10000, "متن پیام بیش از حد طولانی است."),
});

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/contact-messages error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز مشاهده پیام‌ها را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در دریافت پیام‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = createContactMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "اطلاعات واردشده معتبر نیست.",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
        isRead: false,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact-messages error:", error);

    return NextResponse.json(
      { error: "خطا در ثبت پیام" },
      { status: 500 }
    );
  }
}