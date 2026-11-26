import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, requirePermission } from "@/lib/auth/authorization";
import { hashStudentPassword } from "@/lib/auth/student-password";
import {
  iranianMobileSchema,
  iranianNationalIdSchema,
} from "@/lib/validation/student";
import { provisionAdminAccountSchema } from "@/lib/auth/admin-account-validation";
import {
  assignableRolesFor,
  canAssignRole,
} from "@/lib/auth/admin-account-policy";
import { validatePermanentAdminPassword } from "@/lib/auth/admin-auth-validation";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "مدیر ارشد",
  SCHOOL_ADMIN: "مدیر مدرسه",
  CONTENT_MANAGER: "مدیر محتوا",
  TEACHER: "معلم",
  STAFF: "کادر",
};

export async function GET() {
  try {
    const session = await requirePermission("users.view");

    const [users, permissions, rolePermissions, staff] = await Promise.all([
      prisma.user.findMany({
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        include: {
          staff: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true,
              category: true,
            },
          },
          permissions: {
            include: {
              permission: { select: { key: true, name: true, group: true } },
            },
          },
        },
      }),
      prisma.permission.findMany({
        orderBy: [{ group: "asc" }, { name: "asc" }],
      }),
      prisma.rolePermission.findMany({
        select: { role: true, permission: { select: { key: true } } },
      }),
      prisma.staff.findMany({
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        select: {          id: true,          nationalId: true,          firstName: true,          lastName: true,          position: true,          category: true,          email: true,          userId: true,          user: { select: { id: true, name: true, email: true, role: true, isActive: true, permissions: { include: { permission: { select: { key: true, name: true, group: true } } } } } },        },
      }),
    ]);

    const [canCreate, canEdit, canManagePermissions] = await Promise.all([
      hasPermission(session.user.id, "users.create"),
      hasPermission(session.user.id, "users.edit"),
      hasPermission(session.user.id, "users.manage_permissions"),
    ]);

    return NextResponse.json({
      currentUserId: session.user.id,
      canCreate,
      canEdit,
      canManagePermissions,
      assignableRoles: assignableRolesFor(session.user.role),
      roleLabels,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: roleLabels[user.role] ?? user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        staff: user.staff,
        overrides: user.permissions.map((item) => ({
          key: item.permission.key,
          allowed: item.allowed,
        })),
      })),
      permissions,
      staff,
      rolePermissions: rolePermissions.reduce<Record<string, string[]>>((result, item) => {
        (result[item.role] ??= []).push(item.permission.key);
        return result;
      }, {}),
    });
  } catch (error) {
    console.error("Admin account listing failed internally.");
    const status =
      error instanceof Error && error.message === "UNAUTHORIZED" ? 401 :
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { error: status === 403 ? "شما مجوز مدیریت کاربران را ندارید." : "خطا در دریافت کاربران." },
      { status },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("users.create");
    const parsed = provisionAdminAccountSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "اطلاعات حساب معتبر نیست.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    if (!canAssignRole(session.user.role, data.role)) {
      return NextResponse.json(
        { error: "اجازه تعیین این نقش را ندارید." },
        { status: 403 },
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { id: data.staffId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalId: true,
        phone: true,
        userId: true,
        isActive: true,
      },
    });
    if (!staff) {
      return NextResponse.json({ error: "عضو کادر پیدا نشد." }, { status: 404 });
    }
    if (staff.userId) {
      return NextResponse.json({ error: "این عضو کادر از قبل حساب ورود دارد." }, { status: 409 });
    }
    if (!staff.isActive) {
      return NextResponse.json({ error: "برای کادر غیرفعال نمی‌توان حساب ورود ساخت." }, { status: 409 });
    }

    const validatedNationalId = iranianNationalIdSchema.safeParse(staff.nationalId ?? "");
    if (!validatedNationalId.success) {
      return NextResponse.json({ error: "ابتدا کد ملی معتبر را در اطلاعات کادر ثبت کنید." }, { status: 400 });
    }
    if (data.nationalId !== undefined) {
      const requestedNationalId = iranianNationalIdSchema.safeParse(data.nationalId);
      if (!requestedNationalId.success || requestedNationalId.data !== validatedNationalId.data) {
        return NextResponse.json({ error: "کد ملی با اطلاعات عضو کادر مطابقت ندارد." }, { status: 400 });
      }
    }

    const validatedMobile = iranianMobileSchema.safeParse(staff.phone ?? "");
    if (!validatedMobile.success) {
      return NextResponse.json(
        { error: "ابتدا شماره همراه معتبر را در اطلاعات کادر ثبت کنید." },
        { status: 400 },
      );
    }

    const passwordError = validatePermanentAdminPassword(
      data.temporaryPassword,
      validatedNationalId.data,
    );
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const email = data.email?.trim().toLowerCase() || null;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) {
        return NextResponse.json({ error: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است." }, { status: 409 });
      }
    }

    const passwordHash = await hashStudentPassword(data.temporaryPassword);
    const user = await prisma.user.create({
      data: {
        name: data.name || `${staff.firstName} ${staff.lastName}`,
        email,
        role: data.role,
        passwordHash,
        mustChangePassword: true,
        isActive: data.isActive,
        staff: { connect: { id: data.staffId } },
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Admin account provisioning failed internally.");
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "کد ملی یا ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }
    const status =
      error instanceof Error && error.message === "UNAUTHORIZED" ? 401 :
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "شما مجوز ایجاد کاربر را ندارید." : "خطا در ایجاد کاربر." }, { status });
  }
}
