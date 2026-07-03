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
    const customerId = parseInt(resolvedParams.id);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const body = await request.json();
    
    // Process warranty_duration_months to ensure it's either an int or null
    let warranty_duration_months = null;
    if (body.warranty_duration_months) {
      warranty_duration_months = parseInt(body.warranty_duration_months);
    }

    // Process service_interval_months
    let service_interval_months = 3;
    if (body.service_interval_months) {
      service_interval_months = parseInt(body.service_interval_months);
    }

    // Calculate warranty_expiry_date if purchase_date and duration are present
    let warranty_expiry_date = null;
    if (body.purchase_date && warranty_duration_months) {
      const expDate = new Date(body.purchase_date);
      expDate.setMonth(expDate.getMonth() + warranty_duration_months);
      warranty_expiry_date = expDate;
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: body.name,
        phone_number: body.phone_number,
        email: body.email || null,
        address: body.address,
        purifier_model_name: body.purifier_model_name,
        customer_type: body.customer_type,
        service_interval_months: service_interval_months,
        purchase_date: body.purchase_date ? new Date(body.purchase_date) : null,
        warranty_duration_months: warranty_duration_months,
        warranty_expiry_date: warranty_expiry_date
      }
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.customer.delete({
      where: { id: customerId }
    });

    return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
