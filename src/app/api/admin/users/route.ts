import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, requirePermission } from "@/lib/auth/authorization";
import { PERMISSIONS, ROLE_DEFAULT_PERMISSION_KEYS } from "@/lib/auth/permissions";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "مدیر ارشد",
  SCHOOL_ADMIN: "مدیر مدرسه",
  CONTENT_MANAGER: "مدیر محتوا",
  TEACHER: "معلم",
  STAFF: "کادر",
};

async function syncPermissionCatalog() {
  await prisma.$transaction(
    PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: { name: permission.name, group: permission.group },
        create: permission,
      }),
    ),
  );
}

async function syncRoleDefaults() {
  const permissions = await prisma.permission.findMany({
    select: { id: true, key: true },
  });

  const operations = Object.entries(ROLE_DEFAULT_PERMISSION_KEYS).flatMap(
    ([role, keys]) =>
      keys
        .map((key) => permissions.find((permission) => permission.key === key))
        .filter((permission): permission is { id: string; key: string } => Boolean(permission))
        .map((permission) =>
          prisma.rolePermission.upsert({
            where: {
              role_permissionId: {
                role: role as "SUPER_ADMIN" | "SCHOOL_ADMIN" | "CONTENT_MANAGER" | "TEACHER" | "STAFF",
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              role: role as "SUPER_ADMIN" | "SCHOOL_ADMIN" | "CONTENT_MANAGER" | "TEACHER" | "STAFF",
              permissionId: permission.id,
            },
          }),
        ),
  );

  if (operations.length) await prisma.$transaction(operations);
}

export async function GET() {
  try {
    const session = await requirePermission("users.view");

    await syncPermissionCatalog();
    await syncRoleDefaults();

    const [users, permissions, rolePermissions] = await Promise.all([
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
      rolePermissions: rolePermissions.reduce<Record<string, string[]>>((result, item) => {
        (result[item.role] ??= []).push(item.permission.key);
        return result;
      }, {}),
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
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
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = typeof body.role === "string" ? body.role : "STAFF";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "ایمیل معتبر وارد کنید." }, { status: 400 });
    }

    if (!["SUPER_ADMIN", "SCHOOL_ADMIN", "CONTENT_MANAGER", "TEACHER", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "نقش کاربر معتبر نیست." }, { status: 400 });
    }

    if (role === "SUPER_ADMIN" && (session.user.role as string) !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر ارشد می‌تواند مدیر ارشد دیگری ایجاد کند." }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "کاربری با این ایمیل از قبل وجود دارد." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name: name || null, email, role },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    const status =
      error instanceof Error && error.message === "UNAUTHORIZED" ? 401 :
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "شما مجوز ایجاد کاربر را ندارید." : "خطا در ایجاد کاربر." }, { status });
  }
}
