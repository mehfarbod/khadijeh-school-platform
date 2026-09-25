import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorization";

const ROLES = ["SUPER_ADMIN", "SCHOOL_ADMIN", "CONTENT_MANAGER", "TEACHER", "STAFF"] as const;
type Role = (typeof ROLES)[number];

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission("users.edit");
    const { id } = await params;
    const body = await request.json();

    const target = await prisma.user.findUnique({
      where: { id },
      include: { staff: { select: { id: true } } },
    });

    if (!target) {
      return NextResponse.json({ error: "کاربر پیدا نشد." }, { status: 404 });
    }

    const currentRole = session.user.role as string;
    if (target.role === "SUPER_ADMIN" && currentRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر ارشد می‌تواند حساب مدیر ارشد را ویرایش کند." }, { status: 403 });
    }

    const name = body.name === undefined ? target.name : typeof body.name === "string" ? body.name.trim() : null;
    const email = body.email === undefined ? target.email : typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = body.role === undefined ? target.role : body.role;
    const isActive = body.isActive === undefined ? target.isActive : Boolean(body.isActive);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "ایمیل معتبر وارد کنید." }, { status: 400 });
    }

    if (!isRole(role)) {
      return NextResponse.json({ error: "نقش کاربر معتبر نیست." }, { status: 400 });
    }

    if (role === "SUPER_ADMIN" && currentRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر ارشد می‌تواند نقش مدیر ارشد تعیین کند." }, { status: 403 });
    }

    if (id === session.user.id && (!isActive || role !== target.role)) {
      if (!isActive) {
        return NextResponse.json({ error: "نمی‌توانید حسابی را که با آن وارد شده‌اید غیرفعال کنید." }, { status: 400 });
      }
      if (role !== "SUPER_ADMIN" && target.role === "SUPER_ADMIN") {
        return NextResponse.json({ error: "نمی‌توانید نقش حساب فعلی را از مدیر ارشد پایین‌تر بیاورید." }, { status: 400 });
      }
    }

    const emailOwner = await prisma.user.findFirst({
      where: { email, NOT: { id } },
      select: { id: true },
    });
    if (emailOwner) {
      return NextResponse.json({ error: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است." }, { status: 409 });
    }

    const staffId = body.staffId === undefined ? undefined : body.staffId === null || body.staffId === "" ? null : String(body.staffId);

    if (staffId) {
      const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        select: { id: true, userId: true },
      });
      if (!staff) {
        return NextResponse.json({ error: "عضو کادر پیدا نشد." }, { status: 404 });
      }
      if (staff.userId && staff.userId !== id) {
        return NextResponse.json({ error: "این عضو کادر به کاربر دیگری متصل است." }, { status: 409 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { name: name || null, email, role, isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });

      if (staffId !== undefined) {
        await tx.staff.updateMany({
          where: { userId: id },
          data: { userId: null },
        });

        if (staffId) {
          await tx.staff.update({
            where: { id: staffId },
            data: { userId: id },
          });
        }
      }

      if (Array.isArray(body.permissions)) {
        if (currentRole !== "SUPER_ADMIN" && target.role === "SUPER_ADMIN") {
          throw new Error("FORBIDDEN_SUPER_ADMIN");
        }

        const permissionItems = body.permissions.filter(
          (item: unknown): item is { key: string; allowed: boolean | null } =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as { key?: unknown }).key === "string" &&
            ((item as { allowed?: unknown }).allowed === null ||
              typeof (item as { allowed?: unknown }).allowed === "boolean"),
        );

        const keys = [...new Set(permissionItems.map((item: { key: string; allowed: boolean | null }) => item.key))];
        const permissions = await tx.permission.findMany({
          where: { key: { in: keys } },
          select: { id: true, key: true },
        });

        await Promise.all(
          permissionItems.map(async (item) => {
            const permission = permissions.find((candidate) => candidate.key === item.key);
            if (!permission) return;

            if (item.allowed === null) {
              await tx.userPermission.deleteMany({
                where: { userId: id, permissionId: permission.id },
              });
              return;
            }

            await tx.userPermission.upsert({
              where: {
                userId_permissionId: {
                  userId: id,
                  permissionId: permission.id,
                },
              },
              update: { allowed: item.allowed },
              create: { userId: id, permissionId: permission.id, allowed: item.allowed },
            });
          }),
        );
      }

      return updated;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    const message = error instanceof Error ? error.message : "";
    const status =
      message === "UNAUTHORIZED" ? 401 :
      message === "FORBIDDEN" || message === "FORBIDDEN_SUPER_ADMIN" ? 403 : 500;

    return NextResponse.json(
      { error: status === 403 ? "شما مجوز ویرایش این کاربر را ندارید." : "خطا در ویرایش کاربر." },
      { status },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission("users.edit");
    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json({ error: "نمی‌توانید حساب کاربری خودتان را حذف کنید." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!target) {
      return NextResponse.json({ error: "کاربر پیدا نشد." }, { status: 404 });
    }

    if (target.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر ارشد می‌تواند حساب مدیر ارشد را حذف کند." }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    const message = error instanceof Error ? error.message : "";
    const status =
      message === "UNAUTHORIZED" ? 401 :
      message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { error: status === 403 ? "شما مجوز حذف این کاربر را ندارید." : "خطا در حذف کاربر." },
      { status },
    );
  }
}
