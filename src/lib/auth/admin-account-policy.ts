export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "SCHOOL_ADMIN",
  "CONTENT_MANAGER",
  "TEACHER",
  "STAFF",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
  );
}

export function assignableRolesFor(actorRole: string): AdminRole[] {
  if (actorRole === "SUPER_ADMIN") {
    return ["SCHOOL_ADMIN", "CONTENT_MANAGER", "TEACHER", "STAFF"];
  }

  if (actorRole === "SCHOOL_ADMIN") {
    return ["CONTENT_MANAGER", "TEACHER", "STAFF"];
  }

  return [];
}

export function canAssignRole(actorRole: string, targetRole: unknown) {
  return (
    isAdminRole(targetRole) &&
    assignableRolesFor(actorRole).includes(targetRole)
  );
}

export function canManageAccount(actorRole: string, targetRole: string) {
  if (targetRole === "SUPER_ADMIN") return false;
  if (actorRole === "SUPER_ADMIN") return true;

  return (
    actorRole === "SCHOOL_ADMIN" &&
    targetRole !== "SCHOOL_ADMIN"
  );
}
