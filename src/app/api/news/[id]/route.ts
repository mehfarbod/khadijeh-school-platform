import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/authorization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateNewsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان خبر نمی‌تواند خالی باشد.")
    .max(300, "عنوان خبر بیش از حد طولانی است.")
    .optional(),

  slug: z
    .string()
    .trim()
    .min(1, "شناسه خبر نمی‌تواند خالی باشد.")
    .max(300, "شناسه خبر بیش از حد طولانی است.")
    .optional(),

  excerpt: z
    .string()
    .trim()
    .min(1, "خلاصه خبر نمی‌تواند خالی باشد.")
    .max(1000, "خلاصه خبر بیش از حد طولانی است.")
    .optional(),

  content: z
    .string()
    .trim()
    .min(1, "متن خبر نمی‌تواند خالی باشد.")
    .max(50000, "متن خبر بیش از حد طولانی است.")
    .optional(),

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
    .min(1, "دسته‌بندی خبر نمی‌تواند خالی باشد.")
    .max(100, "دسته‌بندی خبر نامعتبر است.")
    .optional(),

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

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        { error: "خبر پیدا نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("GET /api/news/[id] error:", error);

    return NextResponse.json(
      { error: "خطا در دریافت خبر" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;
    const body = await request.json();

    const result = updateNewsSchema.safeParse(body);

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

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),
        ...(data.slug !== undefined && {
          slug: data.slug,
        }),
        ...(data.excerpt !== undefined && {
          excerpt: data.excerpt,
        }),
        ...(data.content !== undefined && {
          content: data.content,
        }),
        ...(data.coverImage !== undefined && {
          coverImage: data.coverImage || null,
        }),
        ...(data.author !== undefined && {
          author: data.author || null,
        }),
        ...(data.category !== undefined && {
          category: data.category,
        }),
        ...(data.tags !== undefined && {
          tags: data.tags,
        }),
        ...(data.isFeatured !== undefined && {
          isFeatured: data.isFeatured,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("PATCH /api/news/[id] error:", error);

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
      { error: "خطا در به‌روزرسانی خبر" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const { id } = await context.params;

    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/news/[id] error:", error);

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
      { error: "خطا در حذف خبر" },
      { status: 500 }
    );
  }
}