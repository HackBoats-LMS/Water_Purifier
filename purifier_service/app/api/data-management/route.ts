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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        service_date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      },
      include: {
        customer: true,
        worker: true
      },
      orderBy: { service_date: 'asc' }
    });

    // Create CSV Header
    const csvHeaders = ["Invoice No", "Service Date", "Status", "Customer Name", "Customer Phone", "Payment Mode", "Service Amount", "Worker Name", "Completed At"];
    const csvRows = assignments.map(a => [
      a.invoice_number || `PM-${new Date(a.service_date).getFullYear()}-${a.id}`,
      new Date(a.service_date).toLocaleDateString(),
      a.status,
      `"${a.customer.name}"`,
      a.customer.phone_number,
      a.payment_mode || "N/A",
      a.service_amount?.toString() || "0",
      `"${a.worker.name}"`,
      a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [csvHeaders.join(","), ...csvRows.map(row => row.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="Service_Records_${startDate}_to_${endDate}.csv"`
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    // Since assignments are linked to customers via Foreign Keys, but there is no cascade needed downwards
    // (Assignments are the children). We can safely delete assignments.
    const deleted = await prisma.assignment.deleteMany({
      where: {
        service_date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      }
    });

    return NextResponse.json({ message: `Successfully deleted ${deleted.count} records.` }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
