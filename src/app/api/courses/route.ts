import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";
import { jalaliToGregorian } from "@/lib/date/jalali";

const courseSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(2).max(1000),
  fullDescription: z.string().trim().max(10000).optional().nullable(),
  coverImage: z.string().trim().url().optional().nullable(),
  instructor: z.string().trim().max(150).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  schedule: z.string().trim().max(300).optional().nullable(),
  duration: z.string().trim().max(100).optional().nullable(),
  capacity: z.coerce.number().int().min(1).max(10000),
  price: z.coerce.number().int().min(0).optional().nullable(),
  status: z.enum(["active", "upcoming"]),
  category: z.string().trim().min(1).max(100),
  gradeLevel: z.string().trim().max(100).optional().nullable(),
  registrationDeadline: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u200c\s]+/g, "-")
    .replace(/[^\u0600-\u06ff\u0750-\u077f\u2000-\u206f\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || `course-${Date.now()}`;
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.course.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

function toDate(value?: string | null) {
  if (!value) return null;

  try {
    return jalaliToGregorian(value);
  } catch {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}

function serialize(course: any) {
  return {
    ...course,
    currentRegistrations: course._count?.registrations ?? 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const slug = searchParams.get("slug");

    const course = slug
      ? await prisma.course.findUnique({
          where: { slug },
          include: { _count: { select: { registrations: true } } },
        })
      : null;

    if (slug) {
      if (!course || (activeOnly && !course.isActive)) {
        return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });
      }
      return NextResponse.json(serialize(course));
    }

    const courses = await prisma.course.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { _count: { select: { registrations: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses.map(serialize));
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "خطا در دریافت دوره‌ها." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("courses.create");
    const body = await request.json();
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "اطلاعات دوره معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: await uniqueSlug(data.slug || data.title),
        description: data.description,
        fullDescription: data.fullDescription || null,
        coverImage: data.coverImage || null,
        instructor: data.instructor || null,
        startDate: toDate(data.startDate),
        endDate: toDate(data.endDate),
        schedule: data.schedule || null,
        duration: data.duration || null,
        capacity: data.capacity,
        price: data.price ?? null,
        status: data.status,
        category: data.category,
        gradeLevel: data.gradeLevel || null,
        registrationDeadline: toDate(data.registrationDeadline),
        isActive: data.isActive ?? true,
        createdById: user.id,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز ایجاد دوره را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ایجاد دوره با خطا مواجه شد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("courses.edit");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه دوره الزامی است." }, { status: 400 });

    const body = await request.json();
    const parsed = courseSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات دوره معتبر نیست." }, { status: 400 });

    const data = parsed.data;
    const current = await prisma.course.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "دوره پیدا نشد." }, { status: 404 });

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined || data.title !== undefined ? { slug: await uniqueSlug(data.slug || data.title || current.title, id) } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.fullDescription !== undefined ? { fullDescription: data.fullDescription || null } : {}),
        ...(data.coverImage !== undefined ? { coverImage: data.coverImage || null } : {}),
        ...(data.instructor !== undefined ? { instructor: data.instructor || null } : {}),
        ...(data.startDate !== undefined ? { startDate: toDate(data.startDate) } : {}),
        ...(data.endDate !== undefined ? { endDate: toDate(data.endDate) } : {}),
        ...(data.schedule !== undefined ? { schedule: data.schedule || null } : {}),
        ...(data.duration !== undefined ? { duration: data.duration || null } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.price !== undefined ? { price: data.price ?? null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.gradeLevel !== undefined ? { gradeLevel: data.gradeLevel || null } : {}),
        ...(data.registrationDeadline !== undefined ? { registrationDeadline: toDate(data.registrationDeadline) } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("PATCH /api/courses error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز ویرایش دوره را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ویرایش دوره با خطا مواجه شد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requirePermission("courses.manage");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه دوره الزامی است." }, { status: 400 });

    const registrations = await prisma.courseRegistration.count({ where: { courseId: id } });
    if (registrations > 0) {
      await prisma.course.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ message: "دوره غیرفعال شد." });
    }

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "دوره حذف شد." });
  } catch (error) {
    console.error("DELETE /api/courses error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز مدیریت دوره‌ها را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "حذف دوره با خطا مواجه شد." }, { status: 500 });
  }
}
