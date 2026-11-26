import "dotenv/config";

import { prisma } from "../lib/prisma";
import { seedPermissionCatalog } from "../lib/auth/permission-seeding";

async function main() {
  const result = await prisma.$transaction((tx) => seedPermissionCatalog(tx));
  console.log(
    `PERMISSIONS_SEEDED permissions=${result.permissions} roles=${result.roles}`,
  );
}

main()
  .catch(() => {
    console.error("PERMISSION_SEED_FAILED");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
