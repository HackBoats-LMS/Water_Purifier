import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const assignmentId = parseInt(resolvedParams.id);
    const workerId = parseInt(session.user.id);
    const { service_amount, payment_mode, invoice_number, remarks } = await request.json();

    // Verify assignment belongs to this worker
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.workerId !== workerId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (assignment.status === "COMPLETED") {
      return NextResponse.json({ error: "Assignment is already completed" }, { status: 400 });
    }

    // Use a transaction to update both the assignment and the customer's last service date
    const updatedData = await prisma.$transaction(async (tx) => {
      const completedAt = new Date();
      
      const updatedAssignment = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: "COMPLETED",
          service_amount: service_amount ? parseFloat(service_amount) : null,
          payment_mode,
          invoice_number,
          remarks,
          completed_at: completedAt
        }
      });

      const updatedCustomer = await tx.customer.update({
        where: { id: assignment.customerId },
        data: {
          last_service_date: completedAt
        }
      });

      return { updatedAssignment, updatedCustomer };
    });

    return NextResponse.json({ message: "Task marked as completed", data: updatedData }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
