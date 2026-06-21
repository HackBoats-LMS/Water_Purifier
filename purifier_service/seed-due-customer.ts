import 'dotenv/config';
import prisma from './lib/prisma';

async function main() {
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    // To make it due in 'i' days, set last service exactly 3 months ago PLUS 'i' days.
    date.setMonth(date.getMonth() - 3);
    date.setDate(date.getDate() + i);

    const customer = await prisma.customer.create({
      data: {
        name: `Due in ${i} Days Customer`,
        phone_number: `000000000${i}`,
        email: `test.due${i}@example.com`,
        address: `${i} Future Avenue`,
        purifier_model_name: "Kent RO Test",
        customer_type: "IN_HOUSE",
        last_service_date: date,
        service_interval_months: 3,
      }
    });

    console.log(`Created customer due in ${i} days:`, customer.name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
