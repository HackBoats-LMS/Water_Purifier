import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const customerId = parseInt(resolvedParams.id);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        customerId: customerId
      },
      include: {
        worker: true
      },
      orderBy: {
        service_date: 'desc'
      }
    });

    return NextResponse.json(assignments, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
