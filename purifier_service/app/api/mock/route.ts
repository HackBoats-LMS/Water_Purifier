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
    // Note: Admin should have role='ADMIN'. Let's avoid deleting the current admin.
    await prisma.assignment.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.worker.deleteMany({
      where: {
        worker_type: "WORKER"
      }
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Workers
    const worker1 = await prisma.worker.create({
      data: { name: "Ramesh FieldTech", phone_number: "9876543210", passwordHash: hashedPassword, worker_type: "WORKER" }
    });
    const worker2 = await prisma.worker.create({
      data: { name: "Suresh Technician", phone_number: "8765432109", passwordHash: hashedPassword, worker_type: "WORKER" }
    });

    // Create Customers
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 95); // Overdue

    const cust1 = await prisma.customer.create({
      data: { name: "John Doe", phone_number: "9998887776", address: "123 Main St, Block A", purifier_model_name: "AquaGuard Pro", customer_type: "IN_HOUSE", service_interval_months: 3, last_service_date: thirtyDaysAgo, purchase_date: new Date("2023-01-15"), warranty_duration_months: 12, warranty_expiry_date: new Date("2024-01-15") }
    });

    const cust2 = await prisma.customer.create({
      data: { name: "Jane Smith", phone_number: "9998887775", address: "456 Oak Lane, Sector 4", purifier_model_name: "Kent RO Plus", customer_type: "External", service_interval_months: 6, last_service_date: ninetyDaysAgo }
    });

    const cust3 = await prisma.customer.create({
      data: { name: "Ravi Kumar", phone_number: "9998887774", address: "789 Pine Road, Suite 2", purifier_model_name: "Livpure Zinger", customer_type: "IN_HOUSE", service_interval_months: 3, last_service_date: ninetyDaysAgo, purchase_date: new Date("2026-01-01"), warranty_duration_months: 24, warranty_expiry_date: new Date("2028-01-01") }
    });

    // Create Assignments
    // 1 Completed
    await prisma.assignment.create({
      data: {
        workerId: worker1.id,
        customerId: cust1.id,
        service_date: thirtyDaysAgo,
        status: "COMPLETED",
        service_amount: 450.00,
        payment_mode: "CASH",
        completed_at: thirtyDaysAgo,
        invoice_number: "INV-2026-0001"
      }
    });

    // 1 Cancelled
    await prisma.assignment.create({
      data: {
        workerId: worker2.id,
        customerId: cust2.id,
        service_date: new Date(),
        status: "CANCELLED"
      }
    });

    // 2 Pending (from overdue customers)
    await prisma.assignment.create({
      data: {
        workerId: worker1.id,
        customerId: cust2.id,
        service_date: new Date(),
        status: "PENDING"
      }
    });

    await prisma.assignment.create({
      data: {
        workerId: worker2.id,
        customerId: cust3.id,
        service_date: new Date(),
        status: "PENDING"
      }
    });

    return NextResponse.json({ message: "Mock data generated successfully." }, { status: 200 });

  } catch (error) {
    console.error(error);
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
