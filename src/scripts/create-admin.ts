import "dotenv/config";

import { bootstrapSuperAdmin } from "../lib/auth/bootstrap-super-admin";
import { prisma } from "../lib/prisma";

async function main() {
  const values = {
    nationalId: process.env.BOOTSTRAP_ADMIN_NATIONAL_ID?.trim(),
    mobile: process.env.BOOTSTRAP_ADMIN_MOBILE?.trim(),
    firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim(),
    lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim(),
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  };
  const hasCompleteInput = Object.values(values).every(Boolean);
  const result = await bootstrapSuperAdmin(
    hasCompleteInput
      ? {
          nationalId: values.nationalId!,
          mobile: values.mobile!,
          firstName: values.firstName!,
          lastName: values.lastName!,
          password: values.password!,
        }
      : undefined,
  );

  console.log(
    result.created
      ? "SUPER_ADMIN_CREATED_CHANGE_PASSWORD_ON_FIRST_LOGIN"
      : "SUPER_ADMIN_ALREADY_EXISTS_NO_ACCOUNT_DATA_CHANGED",
  );
  console.log(
    `PERMISSIONS_SEEDED permissions=${result.permissionSeed.permissions} roles=${result.permissionSeed.roles}`,
  );
}

main()
  .catch(() => {
    console.error("SUPER_ADMIN_BOOTSTRAP_FAILED");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
