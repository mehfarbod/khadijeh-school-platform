import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

export const runtime = "nodejs";

const metadataSchema = z.object({
  title: z.string().trim().min(2).max(200),
  subject: z.string().trim().min(1).max(100),
  grade: z.enum(["grade-10", "grade-11", "grade-12"]),
  duration: z.string().trim().min(1).max(30),
  instructor: z.string().trim().min(2).max(150),
  isActive: z.boolean().default(true),
});

function slugify(value: string) {
  return value.trim().toLowerCase()
    .replace(/[\u200c\s]+/g, "-")
    .replace(/[^\u0600-\u06ff\u0750-\u077f\w-]/g, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || `video-${Date.now()}`;
  let slug = base;
  let n = 2;
  while (await prisma.educationalVideo.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const slug = searchParams.get("slug");
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");

    const where = {
      ...(activeOnly ? { isActive: true } : {}),
      ...(grade ? { grade } : {}),
      ...(subject ? { subject } : {}),
      ...(slug ? { slug } : {}),
    };

    const videos = await prisma.educationalVideo.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (slug) {
      if (!videos[0]) return NextResponse.json({ error: "ویدیو پیدا نشد." }, { status: 404 });
      return NextResponse.json(videos[0]);
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("GET /api/videos error:", error);
    return NextResponse.json({ error: "خطا در دریافت ویدیوها." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let savedPath: string | null = null;

  try {
    const user = await requirePermission("videos.create");
    const formData = await request.formData();

    const parsed = metadataSchema.safeParse({
      title: formData.get("title"),
      subject: formData.get("subject"),
      grade: formData.get("grade"),
      duration: formData.get("duration"),
      instructor: formData.get("instructor"),
      isActive: formData.get("isActive") !== "false",
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "اطلاعات ویدیو معتبر نیست.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const file = formData.get("video");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "فایل ویدیو الزامی است." }, { status: 400 });
    }
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "فقط فایل ویدیویی مجاز است." }, { status: 400 });
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "حجم ویدیو نباید بیشتر از ۵۰۰ مگابایت باشد." }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase() || ".mp4";
    const filename = `${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    savedPath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(savedPath, Buffer.from(await file.arrayBuffer()));

    const video = await prisma.educationalVideo.create({
      data: {
        ...parsed.data,
        slug: await uniqueSlug(parsed.data.title),
        videoUrl: `/uploads/videos/${filename}`,
        createdById: user.user.id,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    if (savedPath) await unlink(savedPath).catch(() => {});
    console.error("POST /api/videos error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز افزودن ویدیو را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "افزودن ویدیو با خطا مواجه شد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requirePermission("videos.edit_all");
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "شناسه ویدیو الزامی است." }, { status: 400 });

    const body = await request.json();
    const parsed = metadataSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "اطلاعات ویدیو معتبر نیست." }, { status: 400 });

    const video = await prisma.educationalVideo.update({ where: { id }, data: parsed.data });
    return NextResponse.json(video);
  } catch (error) {
    console.error("PATCH /api/videos error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "شما مجوز ویرایش ویدیو را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "ویرایش ویدیو با خطا مواجه شد." }, { status: 500 });
  }
}