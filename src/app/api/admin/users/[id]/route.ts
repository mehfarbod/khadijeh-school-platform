import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, requirePermission } from "@/lib/auth/authorization";
import { updateAdminAccountSchema } from "@/lib/auth/admin-account-validation";
import {
  canAssignRole,
  canManageAccount,
} from "@/lib/auth/admin-account-policy";
import {
  iranianMobileSchema,
  iranianNationalIdSchema,
} from "@/lib/validation/student";
import { invalidateOutstandingAdminRecoveryOtps } from "@/lib/auth/admin-recovery-state";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission("users.edit");
    const { id } = await params;
    const parsed = updateAdminAccountSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "اطلاعات ویرایش معتبر نیست.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const permissionsProvided = payload.permissions !== undefined;

    if (
      permissionsProvided &&
      !(await hasPermission(session.user.id, "users.manage_permissions"))
    ) {
      return NextResponse.json(
        { error: "شما مجوز مدیریت دسترسی‌های کاربران را ندارید." },
        { status: 403 },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      include: { staff: { select: { id: true } } },
    });

    if (!target) {
      return NextResponse.json({ error: "کاربر پیدا نشد." }, { status: 404 });
    }

    if (!canManageAccount(session.user.role, target.role)) {
      return NextResponse.json(
        { error: "اجازه مدیریت این حساب را ندارید." },
        { status: 403 },
      );
    }

    const name = payload.name === undefined ? target.name : payload.name?.trim() || null;
    const email = payload.email === undefined
      ? target.email
      : payload.email?.trim()
        ? payload.email.trim().toLowerCase()
        : null;
    const role = payload.role === undefined ? target.role : payload.role;
    const isActive = payload.isActive === undefined ? target.isActive : payload.isActive;

    if (role !== target.role && !canAssignRole(session.user.role, role)) {
      return NextResponse.json({ error: "اجازه تعیین این نقش را ندارید." }, { status: 403 });
    }

    if (id === session.user.id && (!isActive || role !== target.role || payload.staffId !== undefined)) {
      return NextResponse.json({ error: "نمی‌توانید نقش، وضعیت یا اتصال حساب فعلی خود را تغییر دهید." }, { status: 400 });
    }

    if (email) {
      const emailOwner = await prisma.user.findFirst({
        where: { email, NOT: { id } },
        select: { id: true },
      });
      if (emailOwner) {
        return NextResponse.json({ error: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است." }, { status: 409 });
      }
    }

    const staffId = payload.staffId;

    if (staffId) {
      const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        select: { id: true, userId: true, nationalId: true, phone: true, isActive: true },
      });
      if (!staff) {
        return NextResponse.json({ error: "عضو کادر پیدا نشد." }, { status: 404 });
      }
      if (staff.userId && staff.userId !== id) {
        return NextResponse.json({ error: "این عضو کادر به کاربر دیگری متصل است." }, { status: 409 });
      }
      if (
        !staff.isActive ||
        !iranianNationalIdSchema.safeParse(staff.nationalId ?? "").success ||
        !iranianMobileSchema.safeParse(staff.phone ?? "").success
      ) {
        return NextResponse.json(
          { error: "کادر متصل باید فعال و دارای کد ملی و شماره همراه معتبر باشد." },
          { status: 400 },
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          name: name || null,
          email,
          role,
          isActive,
          ...((role !== target.role || isActive !== target.isActive || staffId !== undefined)
            ? { sessionVersion: { increment: 1 } }
            : {}),
        },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });

      const authenticationChanged =
        role !== target.role ||
        isActive !== target.isActive ||
        staffId !== undefined;
      if (authenticationChanged) {
        await invalidateOutstandingAdminRecoveryOtps(tx, id);
      }

      if (staffId !== undefined) {
        await tx.staff.updateMany({
          where: { userId: id },
          data: { userId: null },
        });

        await tx.staff.update({
          where: { id: staffId },
          data: { userId: id },
        });
      }

      if (permissionsProvided && payload.permissions) {
        const permissionItems = payload.permissions;

        const keys: string[] = Array.from(new Set(permissionItems.map((item: { key: string; allowed: boolean | null }) => item.key)));
        const permissions = await tx.permission.findMany({
          where: { key: { in: keys } },
          select: { id: true, key: true },
        });

        if (permissions.length !== keys.length) {
          throw new Error("INVALID_PERMISSION");
        }

        await Promise.all(
          permissionItems.map(async (item: { key: string; allowed: boolean | null }) => {
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
    console.error("Admin account update failed internally.");
    const message = error instanceof Error ? error.message : "";
    const status =
      message === "UNAUTHORIZED" ? 401 :
      message === "FORBIDDEN" ? 403 :
      message === "INVALID_PERMISSION" ? 400 : 500;

    return NextResponse.json(
      {
        error:
          status === 403
            ? "شما مجوز ویرایش این کاربر را ندارید."
            : status === 400
              ? "فهرست دسترسی‌های ارسالی معتبر نیست."
              : "خطا در ویرایش کاربر.",
      },
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

    if (!canManageAccount(session.user.role, target.role)) {
      return NextResponse.json({ error: "اجازه حذف این حساب را ندارید." }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin account deletion failed internally.");
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
