import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const assignmentId = parseInt(resolvedParams.id);

    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
    }

    const body = await request.json();

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        invoice_number: body.invoice_number,
        service_amount: body.service_amount !== undefined ? parseFloat(body.service_amount) : undefined,
        payment_mode: body.payment_mode,
        service_date: body.service_date ? new Date(body.service_date) : undefined,
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
