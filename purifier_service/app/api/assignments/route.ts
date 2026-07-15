import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { sendAssignmentWhatsappMessage } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workerId, customerId, service_date, status, invoice_number, service_amount, payment_mode, complaint } = await request.json();

    if (!workerId || !customerId || !service_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        workerId: parseInt(workerId),
        customerId: parseInt(customerId),
        service_date: new Date(service_date),
        status: status === "COMPLETED" ? "COMPLETED" : "PENDING",
        complaint: complaint || null,
        ...(status === "COMPLETED" && {
          completed_at: new Date(),
          invoice_number: invoice_number || null,
          service_amount: service_amount ? parseFloat(service_amount) : null,
          payment_mode: payment_mode || null
        }),
        
      },include:{
        customer:true,
        worker:true
        }
    });

    if (status === "COMPLETED") {
       await prisma.customer.update({
         where: { id: parseInt(customerId) },
         data: { last_service_date: new Date() }
       });
    }
    
    await sendAssignmentWhatsappMessage({
      CustomerName: assignment.customer.name,
      CustomerPhoneNumber: assignment.customer.phone_number,
      WorkerName: assignment.worker.name,
      WorkerContact: assignment.worker.phone_number,
      ServiceDate: formatDate(assignment.service_date),
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
      include: {
        worker: { select: { id: true, name: true, phone_number: true } },
        customer: { select: { id: true, name: true, phone_number: true, address: true, purifier_model_name: true } }
      },
      orderBy: {
        service_date: "desc"
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
