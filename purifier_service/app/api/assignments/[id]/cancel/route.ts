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

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.status !== "PENDING") {
      return NextResponse.json({ error: "Only PENDING assignments can be cancelled" }, { status: 400 });
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "CANCELLED" }
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
