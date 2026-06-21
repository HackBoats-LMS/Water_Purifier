import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Workers can see all assignments (as per requirements "dashboard for them to see their assignments and also all people assignments")
    const assignments = await prisma.assignment.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        worker: { select: { id: true, name: true, phone_number: true } },
        customer: { select: { id: true, name: true, phone_number: true, address: true, purifier_model_name: true } }
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
