import type { Prisma } from "@/generated/prisma/client";
import type { UserRole } from "@/generated/prisma/enums";

import {
  PERMISSIONS,
  ROLE_DEFAULT_PERMISSION_KEYS,
} from "@/lib/auth/permissions";

export async function seedPermissionCatalog(tx: Prisma.TransactionClient) {
  const permissionsByKey = new Map<string, string>();

  for (const definition of PERMISSIONS) {
    const permission = await tx.permission.upsert({
      where: { key: definition.key },
      update: { name: definition.name, group: definition.group },
      create: definition,
      select: { id: true, key: true },
    });
    permissionsByKey.set(permission.key, permission.id);
  }

  for (const [role, keys] of Object.entries(ROLE_DEFAULT_PERMISSION_KEYS)) {
    const userRole = role as UserRole;
    const permissionIds = keys.map((key) => {
      const id = permissionsByKey.get(key);
      if (!id) throw new Error(`UNKNOWN_PERMISSION:${key}`);
      return id;
    });

    for (const permissionId of permissionIds) {
      await tx.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: userRole,
            permissionId,
          },
        },
        update: {},
        create: {
          role: userRole,
          permissionId,
        },
      });
    }
  }

  return {
    permissions: permissionsByKey.size,
    roles: Object.keys(ROLE_DEFAULT_PERMISSION_KEYS).length,
  };
}
