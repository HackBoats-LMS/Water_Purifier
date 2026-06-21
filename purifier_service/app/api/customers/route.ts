import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone_number,
      address,
      purifier_model_name,
      purifier_model_number,
      customer_type,
      expiry_date,
      service_interval_months,
      last_service_date,
      email,
      purchase_date,
      warranty_duration_months,
    } = body;

    if (!name || !phone_number || !address || !purifier_model_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let warranty_expiry_date = null;
    let parsedPurchaseDate = purchase_date ? new Date(purchase_date) : null;
    let parsedWarrantyDuration = warranty_duration_months ? parseInt(warranty_duration_months) : null;

    if (customer_type === "IN_HOUSE" && parsedPurchaseDate && parsedWarrantyDuration) {
      warranty_expiry_date = new Date(parsedPurchaseDate);
      warranty_expiry_date.setMonth(warranty_expiry_date.getMonth() + parsedWarrantyDuration);
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone_number,
        address,
        purifier_model_name,
        purifier_model_number,
        customer_type,
        email,
        purchase_date: parsedPurchaseDate,
        warranty_duration_months: parsedWarrantyDuration,
        warranty_expiry_date,
        // Convert dates if provided
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        last_service_date: last_service_date ? new Date(last_service_date) : null,
        service_interval_months: service_interval_months ? parseInt(service_interval_months) : 3,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
