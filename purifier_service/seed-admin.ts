import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const phone_number = "1234567890";
  const password = "hackboats";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.worker.findUnique({
    where: { phone_number },
  });

  if (existingAdmin) {
    console.log(`User with phone ${phone_number} already exists. Updating password to 'hackboats' and setting role to ADMIN...`);
    await prisma.worker.update({
      where: { phone_number },
      data: {
        passwordHash: hashedPassword,
        worker_type: "ADMIN",
        name: "Admin",
      },
    });
    console.log("Updated existing admin account.");
  } else {
    console.log(`Creating new admin user with phone ${phone_number}...`);
    await prisma.worker.create({
      data: {
        name: "Admin",
        phone_number,
        passwordHash: hashedPassword,
        worker_type: "ADMIN",
      },
    });
    console.log("Successfully created new admin account.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
