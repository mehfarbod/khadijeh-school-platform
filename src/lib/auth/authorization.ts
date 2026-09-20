import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "CONTENT_MANAGER";

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