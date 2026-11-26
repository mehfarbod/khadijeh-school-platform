import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireRole } from "@/lib/auth/authorization";
import {
  iranianMobileSchema,
  iranianNationalIdSchema,
} from "@/lib/validation/student";
import { canManageAccount } from "@/lib/auth/admin-account-policy";
import { invalidateOutstandingAdminRecoveryOtps } from "@/lib/auth/admin-recovery-state";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateStaffSchema = z.object({
  nationalId: z.preprocess(
    (value) => value === "" ? undefined : value,
    iranianNationalIdSchema.optional(),
  ),

  firstName: z
    .string()
    .trim()
    .min(1, "نام نمی‌تواند خالی باشد.")
    .max(100, "نام بیش از حد طولانی است.")
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی نمی‌تواند خالی باشد.")
    .max(100, "نام خانوادگی بیش از حد طولانی است.")
    .optional(),

  position: z
    .string()
    .trim()
    .min(1, "سمت نمی‌تواند خالی باشد.")
    .max(100, "سمت بیش از حد طولانی است.")
    .optional(),

  subject: z
    .string()
    .trim()
    .max(150, "نام درس بیش از حد طولانی است.")
    .nullable()
    .optional(),

  category: z
    .string()
    .trim()
    .min(1, "دسته‌بندی نمی‌تواند خالی باشد.")
    .max(100, "دسته‌بندی بیش از حد طولانی است.")
    .optional(),

  bio: z
    .string()
    .trim()
    .max(3000, "شرح سوابق بیش از حد طولانی است.")
    .nullable()
    .optional(),

  education: z
    .string()
    .trim()
    .max(500, "مدرک تحصیلی بیش از حد طولانی است.")
    .nullable()
    .optional(),

  photo: z
    .string()
    .trim()
    .max(2000, "آدرس تصویر بیش از حد طولانی است.")
    .nullable()
    .optional(),

  phone: iranianMobileSchema.nullable().optional(),

  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است.")
    .max(255, "ایمیل بیش از حد طولانی است.")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("staff.edit");

    const { id } = await context.params;
    const body = await request.json();

    const result = updateStaffSchema.safeParse(body);

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

    const existing = await prisma.staff.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true, isActive: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "عضو کادر پیدا نشد." }, { status: 404 });
    }
    if (existing.user && !canManageAccount(session.user.role, existing.user.role)) {
      return NextResponse.json(
        { error: "اجازه ویرایش حساب این عضو کادر را ندارید." },
        { status: 403 },
      );
    }

    const nextActive = data.isActive ?? existing.isActive;
    const nextPhone = data.phone === undefined ? existing.phone : data.phone;
    if (existing.user && (nextActive === false || !iranianMobileSchema.safeParse(nextPhone ?? "").success)) {
      if (nextActive !== false) {
        return NextResponse.json(
          { error: "حساب ورود فعال باید شماره همراه معتبر داشته باشد." },
          { status: 400 },
        );
      }
    }

    const staff = await prisma.$transaction(async (tx) => {
      const updated = await tx.staff.update({
        where: { id },
        data: {
        ...(data.nationalId !== undefined && {
          nationalId: data.nationalId,
        }),
        ...(data.firstName !== undefined && {
          firstName: data.firstName,
        }),
        ...(data.lastName !== undefined && {
          lastName: data.lastName,
        }),
        ...(data.position !== undefined && {
          position: data.position,
        }),
        ...(data.subject !== undefined && {
          subject: data.subject || null,
        }),
        ...(data.category !== undefined && {
          category: data.category,
        }),
        ...(data.bio !== undefined && {
          bio: data.bio || null,
        }),
        ...(data.education !== undefined && {
          education: data.education || null,
        }),
        ...(data.photo !== undefined && {
          photo: data.photo || null,
        }),
        ...(data.phone !== undefined && {
          phone: data.phone || null,
        }),
        ...(data.email !== undefined && {
          email: data.email || null,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
        },
      });

      if (existing.user) {
        const authenticationChanged =
          data.nationalId !== undefined ||
          data.isActive !== undefined ||
          data.phone !== undefined;
        await tx.user.update({
          where: { id: existing.user.id },
          data: {
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(authenticationChanged && { sessionVersion: { increment: 1 } }),
          },
        });
        if (authenticationChanged) {
          await invalidateOutstandingAdminRecoveryOtps(
            tx,
            existing.user.id,
          );
        }
      }

      return updated;
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Staff update failed internally.");

    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "این کد ملی یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

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
      { error: "خطا در ویرایش اطلاعات کادر" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("staff.edit");

    const { id } = await context.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: { user: { select: { role: true } } },
    });
    if (!staff) {
      return NextResponse.json({ error: "عضو کادر پیدا نشد." }, { status: 404 });
    }
    if (staff.user) {
      if (!canManageAccount(session.user.role, staff.user.role)) {
        return NextResponse.json({ error: "اجازه حذف این عضو کادر را ندارید." }, { status: 403 });
      }
      return NextResponse.json(
        { error: "ابتدا حساب ورود این عضو را غیرفعال و حذف کنید." },
        { status: 409 },
      );
    }

    await prisma.staff.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff deletion failed internally.");

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
      { error: "خطا در حذف عضو کادر" },
      { status: 500 }
    );
  }
}
