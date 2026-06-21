import 'dotenv/config';
import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('akhil@123', 10);
  
  // Upsert Worker
  const worker = await prisma.worker.upsert({
    where: { phone_number: '9390332543' },
    update: { passwordHash: hashedPassword, name: 'akhil', worker_type: 'WORKER' },
    create: {
      name: 'akhil',
      phone_number: '9390332543',
      passwordHash: hashedPassword,
      worker_type: 'WORKER'
    }
  });
  console.log('Created worker:', worker);

  // Upsert Customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Demo Customer',
      phone_number: '9998887771',
      address: '123 Testing Lane, Tech Park',
      purifier_model_name: 'AquaGuard Pro',
      customer_type: 'IN_HOUSE',
      service_interval_months: 3,
      purchase_date: new Date()
    }
  });
  console.log('Created customer:', customer);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
