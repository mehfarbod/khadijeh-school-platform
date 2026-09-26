import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requirePermission } from "@/lib/auth/authorization";

const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: NextRequest) {
  try {
    await requirePermission("programs.manage");
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "فایل تصویر ارسال نشده است." }, { status: 400 });
    const extension = allowed.get(file.type);
    if (!extension) return NextResponse.json({ error: "فرمت مجاز: JPG، PNG یا WEBP." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "حداکثر حجم تصویر ۵ مگابایت است." }, { status: 400 });
    const dir = path.join(process.cwd(), "public", "uploads", "programs");
    await mkdir(dir, { recursive: true });
    const name = String(Date.now()) + "-" + crypto.randomUUID() + "." + extension;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: "/uploads/programs/" + name }, { status: 201 });
  } catch (error) {
    console.error("POST /api/uploads error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    if (error instanceof Error && error.message === "FORBIDDEN") return NextResponse.json({ error: "مجوز بارگذاری فایل را ندارید." }, { status: 403 });
    return NextResponse.json({ error: "بارگذاری تصویر با خطا مواجه شد." }, { status: 500 });
  }
}