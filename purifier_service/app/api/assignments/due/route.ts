import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all customers
    const customers = await prisma.customer.findMany({
      include: {
        assignments: {
          where: { status: "PENDING" }
        }
      }
    });

    // 2. Filter customers whose service is due within the next 45 days (for next month projection)
    const today = new Date();
    const fortyFiveDaysFromNow = new Date();
    fortyFiveDaysFromNow.setDate(today.getDate() + 45);

    const dueCustomersWithDates = customers.map(c => {
      let nextServiceDate = new Date(); // default to today if no last service date
      if (c.last_service_date) {
        nextServiceDate = new Date(c.last_service_date);
        nextServiceDate.setMonth(nextServiceDate.getMonth() + (c.service_interval_months || 3));
      }
      return { ...c, nextServiceDate };
    }).filter(c => {
      // If they already have a pending assignment, don't show them
      if (c.assignments.length > 0) return false;

      // Check if the next service date is before 45 days from now
      return c.nextServiceDate <= fortyFiveDaysFromNow;
    });

    // Sort by priority: nearest date first
    dueCustomersWithDates.sort((a, b) => a.nextServiceDate.getTime() - b.nextServiceDate.getTime());

    return NextResponse.json(dueCustomersWithDates);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
