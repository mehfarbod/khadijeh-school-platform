import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "CONTENT_MANAGER"
  | "TEACHER"
  | "STAFF";

export async function getCurrentSession() {
  const nextAuthSession = await getServerSession(authOptions);
  if (nextAuthSession?.user?.id) return nextAuthSession;

  const admin = await getAuthenticatedAdmin();
  if (!admin) return null;

  return {
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      accountType: "admin",
    },
  };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true, mustChangePassword: true },
  });

  if (!user || !user.isActive || user.mustChangePassword) {
    throw new Error("UNAUTHORIZED");
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error("FORBIDDEN");
  }

  // NextAuth stores the role in a JWT. Refresh the role from the database
  // after authorization so downstream role-based data filters cannot rely on
  // a stale role claim after an administrator changes a user's role.
  return {
    ...session,
    user: {
      ...session.user,
      role: user.role,
    },
  };
}

/**
 * Checks a user's effective permission.
 *
 * Resolution order:
 * 1. SUPER_ADMIN always has access.
 * 2. An explicit user override wins when it exists.
 * 3. Otherwise the permission inherited from the user's role is used.
 */
export async function hasPermission(
  userId: string,
  permissionKey: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isActive: true,
      mustChangePassword: true,
      permissions: {
        where: {
          permission: {
            key: permissionKey,
          },
        },
        select: {
          allowed: true,
        },
      },
    },
  });

  if (!user || !user.isActive || user.mustChangePassword) {
    return false;
  }

  if (user.role === "SUPER_ADMIN") {
    return true;
  }

  const override = user.permissions[0];

  if (override) {
    return override.allowed;
  }

  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role: user.role,
      permission: {
        key: permissionKey,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(rolePermission);
}

export async function requirePermission(permissionKey: string) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const allowed = await hasPermission(
    session.user.id,
    permissionKey
  );

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
