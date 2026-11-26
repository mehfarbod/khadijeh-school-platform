import { prisma } from "@/lib/prisma";
import { hashStudentPassword } from "@/lib/auth/student-password";
import { bootstrapSuperAdminSchema } from "@/lib/auth/admin-account-validation";
import { seedPermissionCatalog } from "@/lib/auth/permission-seeding";

export type BootstrapSuperAdminInput = {
  nationalId: string;
  mobile: string;
  firstName: string;
  lastName: string;
  password: string;
};

export async function bootstrapSuperAdmin(rawInput?: BootstrapSuperAdminInput) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(928347561)::text AS lock`;
    const permissionSeed = await seedPermissionCatalog(tx);

    const existingSuperAdmin = await tx.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    if (existingSuperAdmin) {
      return {
        created: false as const,
        userId: existingSuperAdmin.id,
        permissionSeed,
      };
    }

    const input = bootstrapSuperAdminSchema.parse(rawInput);
    const passwordHash = await hashStudentPassword(input.password);

    const existingStaff = await tx.staff.findUnique({
      where: { nationalId: input.nationalId },
      select: { id: true },
    });
    if (existingStaff) throw new Error("BOOTSTRAP_NATIONAL_ID_ALREADY_EXISTS");

    const staff = await tx.staff.create({
      data: {
        nationalId: input.nationalId,
        firstName: input.firstName,
        lastName: input.lastName,
        position: "مدیر ارشد",
        category: "مدیریت",
        phone: input.mobile,
        isActive: true,
        user: {
          create: {
            name: `${input.firstName} ${input.lastName}`,
            role: "SUPER_ADMIN",
            passwordHash,
            mustChangePassword: true,
            sessionVersion: 0,
            isActive: true,
          },
        },
      },
      select: { userId: true },
    });

    if (!staff.userId) throw new Error("BOOTSTRAP_USER_LINK_FAILED");

    return {
      created: true as const,
      userId: staff.userId,
      permissionSeed,
    };
  });
}
