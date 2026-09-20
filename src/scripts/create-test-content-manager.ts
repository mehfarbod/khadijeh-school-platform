import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "content-test@khadijeh-school.ir";

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "CONTENT_MANAGER",
      isActive: true,
      name: "کاربر تست محتوا",
    },
    create: {
      email,
      name: "کاربر تست محتوا",
      role: "CONTENT_MANAGER",
      isActive: true,
    },
  });

  console.log("Test user created:");
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