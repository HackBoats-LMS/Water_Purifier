import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely delete existing non-admin workers, customers, assignments
    await prisma.assignment.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.worker.deleteMany({
      where: {
        worker_type: "WORKER"
      }
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create 15 Workers
    const workersData = Array.from({ length: 15 }).map((_, i) => ({
      name: `Worker ${i + 1}`,
      phone_number: `98765432${i.toString().padStart(2, '0')}`,
      passwordHash: hashedPassword,
      worker_type: "WORKER" as const
    }));
    await prisma.worker.createMany({ data: workersData });
    const workers = await prisma.worker.findMany({ where: { worker_type: "WORKER" } });

    // Helper functions
    const now = new Date();
    
    // Function to calculate last_service_date to result in a specific nextServiceDate
    // nextServiceDate = last_service_date + 3 months
    // so last_service_date = nextServiceDate - 3 months
    const getTargetLastServiceDate = (diffDaysFromToday: number) => {
      const targetNextService = new Date(now);
      targetNextService.setDate(targetNextService.getDate() + diffDaysFromToday);
      
      const lastService = new Date(targetNextService);
      lastService.setMonth(lastService.getMonth() - 3);
      return lastService;
    };

    const customersData: any[] = [];
    
    // We need around 30 customers. We will split them into 4 groups:
    // 7 Overdue (< 0 days) -> e.g. -5 days
    // 8 This week (0 to 7 days) -> e.g. +3 days
    // 8 Next week (8 to 14 days) -> e.g. +10 days
    // 7 Later (> 14 days, but < 45 days so they show up) -> e.g. +20 days

    const generateCustomers = (count: number, startDays: number, endDays: number, offset: number) => {
      for (let i = 0; i < count; i++) {
        const randomDiff = Math.floor(Math.random() * (endDays - startDays + 1)) + startDays;
        const lastServiceDate = getTargetLastServiceDate(randomDiff);
        const index = offset + i;
        
        customersData.push({
          name: `Customer ${index + 1}`,
          phone_number: `99988877${index.toString().padStart(2, '0')}`,
          address: `Address ${index + 1}, Some Block`,
          purifier_model_name: index % 2 === 0 ? "AquaGuard Pro" : "Kent RO Plus",
          customer_type: index % 3 === 0 ? "External" : "IN_HOUSE",
          service_interval_months: 3,
          last_service_date: lastServiceDate
        });
      }
    };

    generateCustomers(7, -15, -1, 0); // Overdue
    generateCustomers(8, 0, 6, 7);    // This week
    generateCustomers(8, 8, 13, 15);  // Next week
    generateCustomers(7, 15, 30, 23); // Later

    await prisma.customer.createMany({ data: customersData });
    const customers = await prisma.customer.findMany();

    // Create 1 Completed Assignment (Service Record) for each customer on their last_service_date
    const assignmentsData: any[] = [];
    for (let i = 0; i < customers.length; i++) {
      const cust = customers[i];
      if (cust.last_service_date) {
        assignmentsData.push({
          workerId: workers[i % workers.length].id,
          customerId: cust.id,
          service_date: cust.last_service_date,
          status: "COMPLETED" as const,
          service_amount: 450.00,
          payment_mode: "CASH",
          completed_at: cust.last_service_date,
          invoice_number: `INV-2026-${(1000 + i).toString()}`
        });
      }
    }

    await prisma.assignment.createMany({ data: assignmentsData });

    return NextResponse.json({ message: "Mock data generated successfully." }, { status: 200 });

  } catch (error) {
    console.error("Mock API Error:", error);
    return NextResponse.json({ error: "Failed to generate mock data." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Wipe all data except admins
    await prisma.assignment.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.worker.deleteMany({
      where: {
        worker_type: "WORKER"
      }
    });

    return NextResponse.json({ message: "Mock data deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete mock data." }, { status: 500 });
  }
}
