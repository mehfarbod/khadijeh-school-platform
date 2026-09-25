import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "CONTENT_MANAGER"
  | "TEACHER"
  | "STAFF";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const role = session.user.role as UserRole;

  if (!allowedRoles.includes(role)) {
    throw new Error("FORBIDDEN");
  }

  return session;
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

  if (!user || !user.isActive) {
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
