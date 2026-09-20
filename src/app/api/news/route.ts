import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

const createNewsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان خبر الزامی است.")
    .max(300, "عنوان خبر بیش از حد طولانی است."),

  slug: z
    .string()
    .trim()
    .min(1, "شناسه خبر الزامی است.")
    .max(300, "شناسه خبر بیش از حد طولانی است."),

  excerpt: z
    .string()
    .trim()
    .min(1, "خلاصه خبر الزامی است.")
    .max(1000, "خلاصه خبر بیش از حد طولانی است."),

  content: z
    .string()
    .trim()
    .min(1, "متن خبر الزامی است.")
    .max(50000, "متن خبر بیش از حد طولانی است."),

  coverImage: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  author: z
    .string()
    .trim()
    .max(150, "نام نویسنده بیش از حد طولانی است.")
    .nullable()
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "دسته‌بندی خبر الزامی است.")
    .max(100, "دسته‌بندی خبر نامعتبر است."),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "برچسب نمی‌تواند خالی باشد.")
        .max(100, "برچسب بیش از حد طولانی است.")
    )
    .max(30, "تعداد برچسب‌ها بیش از حد مجاز است.")
    .optional(),

  isFeatured: z.boolean().optional(),

  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const activeOnly = searchParams.get("activeOnly") !== "false";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";

    const news = await prisma.news.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(category ? { category } : {}),
        ...(featured ? { isFeatured: true } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("GET /api/news error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت اخبار" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const body = await request.json();

    const result = createNewsSchema.safeParse(body);

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

    const news = await prisma.news.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || null,
        author: data.author || null,
        category: data.category,
        tags: data.tags ?? [],
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("POST /api/news error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "احراز هویت الزامی است." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز انجام این عملیات را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "خطا در ایجاد خبر" },
      { status: 500 }
    );
  }
}