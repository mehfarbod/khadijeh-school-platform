
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { requireRole } from "@/lib/auth/authorization";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "فایل تصویر ارسال نشده است." }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: "فرمت تصویر باید JPG، PNG یا WebP باشد." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "فایل تصویر خالی است." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "staff");
    const filePath = path.join(uploadDirectory, fileName);

    await mkdir(uploadDirectory, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/staff/${fileName}`,
    });
  } catch (error) {
    console.error("POST /api/admin/uploads/staff-photo error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "شما مجوز آپلود تصویر را ندارید." },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: "خطا در آپلود تصویر." }, { status: 500 });
  }
}
