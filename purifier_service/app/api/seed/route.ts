import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const passwordHash = await hash("akhil@1234", 10);
    
    const worker = await prisma.worker.upsert({
      where: { phone_number: "9390332543" },
      update: {
        passwordHash: passwordHash
      },
      create: {
        name: "Akhil",
        phone_number: "9390332543",
        passwordHash: passwordHash,
        worker_type: "ADMIN",
      }
    });

    return NextResponse.json({ success: true, worker });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
