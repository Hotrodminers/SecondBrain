import { PrismaClient } from "./src/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      emailVerified: true,
    }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
