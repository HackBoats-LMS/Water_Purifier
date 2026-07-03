import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone_number, email } = await request.json();

    if (!name || !phone_number) {
      return NextResponse.json({ error: "Name and Phone number are required" }, { status: 400 });
    }

    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    // Check if phone number is used by another worker
    const existing = await prisma.worker.findFirst({
      where: {
        phone_number: phone_number,
        id: { not: workerId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Phone number already in use by another worker" }, { status: 400 });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        name,
        phone_number,
        email: email || null
      }
    });

    return NextResponse.json({ message: "Worker details updated successfully", worker: updatedWorker }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    if (isNaN(workerId)) {
      return NextResponse.json({ error: "Invalid worker ID" }, { status: 400 });
    }

    await prisma.worker.delete({
      where: { id: workerId }
    });

    return NextResponse.json({ message: "Worker deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
