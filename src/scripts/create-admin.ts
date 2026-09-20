import "dotenv/config";
import { prisma } from "../lib/prisma";


async function main() {
  const email = "admin@khadijeh-school.ir";

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      role: "SUPER_ADMIN",
      isActive: true,
      name: "مدیر سیستم",
    },
    create: {
      email,
      name: "مدیر سیستم",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Admin created:");
  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });