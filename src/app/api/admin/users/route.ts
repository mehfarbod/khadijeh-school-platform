import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission, requirePermission } from "@/lib/auth/authorization";
import { hashStudentPassword } from "@/lib/auth/student-password";
import { iranianNationalIdSchema } from "@/lib/validation/student";

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
    const emailValue = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const email = emailValue || null;
    const role = typeof body.role === "string" ? body.role : "STAFF";
    const staffId = body.staffId === undefined || body.staffId === null || body.staffId === "" ? null : String(body.staffId);
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "ایمیل معتبر نیست." }, { status: 400 });
    }

    if (!["SUPER_ADMIN", "SCHOOL_ADMIN", "CONTENT_MANAGER", "TEACHER", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "نقش کاربر معتبر نیست." }, { status: 400 });
    }

    if (role === "SUPER_ADMIN" && (session.user.role as string) !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "فقط مدیر ارشد می‌تواند مدیر ارشد دیگری ایجاد کند." }, { status: 403 });
    }

    if (!staffId) {
      return NextResponse.json({ error: "برای ساخت حساب ورود باید عضو کادر مشخص شود." }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, lastName: true, nationalId: true, userId: true },
    });
    if (!staff) {
      return NextResponse.json({ error: "عضو کادر پیدا نشد." }, { status: 404 });
    }
    if (staff.userId) {
      return NextResponse.json({ error: "این عضو کادر از قبل حساب ورود دارد." }, { status: 409 });
    }

    const validatedNationalId = iranianNationalIdSchema.safeParse(staff.nationalId ?? "");
    if (!validatedNationalId.success) {
      return NextResponse.json({ error: "ابتدا کد ملی معتبر را در اطلاعات کادر ثبت کنید." }, { status: 400 });
    }
    if (body.nationalId !== undefined) {
      const requestedNationalId = iranianNationalIdSchema.safeParse(body.nationalId);
      if (!requestedNationalId.success || requestedNationalId.data !== validatedNationalId.data) {
        return NextResponse.json({ error: "کد ملی با اطلاعات عضو کادر مطابقت ندارد." }, { status: 400 });
      }
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) {
        return NextResponse.json({ error: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است." }, { status: 409 });
      }
    }

    const passwordHash = await hashStudentPassword(validatedNationalId.data);
    const user = await prisma.user.create({
      data: {
        name: name || `${staff.firstName} ${staff.lastName}`,
        email,
        role: role as "SUPER_ADMIN" | "SCHOOL_ADMIN" | "CONTENT_MANAGER" | "TEACHER" | "STAFF",
        passwordHash,
        mustChangePassword: true,
        isActive,
        staff: { connect: { id: staffId } },
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "کد ملی یا ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }
    const status =
      error instanceof Error && error.message === "UNAUTHORIZED" ? 401 :
      error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "شما مجوز ایجاد کاربر را ندارید." : "خطا در ایجاد کاربر." }, { status });
  }
}
