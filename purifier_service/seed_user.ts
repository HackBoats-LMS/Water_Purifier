import { PrismaClient } from "./app/generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    }
} as any);

async function main() {
  const passwordHash = await hash("akhil@1234", 10);
  
  const worker = await prisma.worker.upsert({
    where: { phone_number: "9390332543" },
    update: {
      passwordHash: passwordHash
    },
    create: {
      name: "Akhil",
      phone_number: "9390332543",
      passwordHash: passwordHash,
      worker_type: "ADMIN",
    }
  });

  console.log("Worker created/updated:", worker);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
