import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { new_password } = await request.json();

    if (!new_password) {
      return NextResponse.json({ error: "New password is required" }, { status: 400 });
    }

    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        passwordHash: hashedPassword
      }
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
