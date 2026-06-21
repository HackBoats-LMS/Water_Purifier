import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // We only want logged in users. Both ADMIN and WORKER can view this technically,
    // but usually it's for WORKERs.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workerId = parseInt(session.user.id);

    // Fetch assignments for this specific worker that are PENDING
    const assignments = await prisma.assignment.findMany({
      where: {
        workerId: workerId,
        status: "PENDING",
      },
      include: {
        customer: true, // we need customer details
      },
      orderBy: {
        service_date: "asc"
      }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
