import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendTextWhatsappMessage, sendAssignmentWhatsappMessage } from "@/lib/whatsapp";
import { formatDate } from "@/lib/utils";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "my_secure_verify_token";

// GET endpoint for Meta Webhook Verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode && token) {
    // Check if the token matches your environment variable
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
}

// POST endpoint for receiving WhatsApp messages and statuses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Incoming Webhook payload:", JSON.stringify(body, null, 2));

    // Check if it's a WhatsApp API event
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phoneNumber = body.entry[0].changes[0].value.contacts[0].wa_id;
        const msgBody = body.entry[0].changes[0].value.messages[0].text?.body?.trim();
        console.log(`Received message from ${phoneNumber}: ${msgBody}`);

        if (msgBody) {
          const lowerBody = msgBody.toLowerCase();
          console.log(`[Webhook] Processing message text: "${msgBody}"`);
          
          // Check if they are trying to change the date, or just sent a date
          const dateMatch = msgBody.match(/(\d{4}-\d{2}-\d{2})/);
          
          if (dateMatch || lowerBody.includes("change date") || lowerBody.includes("reschedule")) {
            if (dateMatch) {
              const newDateString = dateMatch[1];
              const newDate = new Date(newDateString);

              if (!isNaN(newDate.getTime())) {
                const localPhone = phoneNumber.startsWith("91") ? phoneNumber.slice(2) : phoneNumber;
                console.log(`[Webhook] Looking for customer with phone containing: ${localPhone}`);

                // Use contains to avoid +91 or other prefix issues
                const customer = await prisma.customer.findFirst({
                  where: { phone_number: { contains: localPhone } }
                });

                if (customer) {
                  console.log(`[Webhook] Found customer: ${customer.name} (ID: ${customer.id})`);
                  
                  // Find their pending assignment
                  const assignment = await prisma.assignment.findFirst({
                    where: { customerId: customer.id, status: "PENDING" },
                    orderBy: { service_date: "asc" },
                    include: {
                      worker: true,
                      customer: true
                    }
                  });

                  if (assignment) {
                    console.log(`[Webhook] Found pending assignment ID: ${assignment.id}. Updating date to ${newDateString}...`);
                    await prisma.assignment.update({
                      where: { id: assignment.id },
                      data: { service_date: newDate }
                    });

                    console.log(`[Webhook] Date updated. Sending confirmation message to customer...`);
                    // Send confirmation to Customer using Template
                    await sendAssignmentWhatsappMessage({
                      CustomerName: assignment.customer.name,
                      CustomerPhoneNumber: assignment.customer.phone_number,
                      WorkerName: assignment.worker.name,
                      WorkerContact: assignment.worker.phone_number,
                      ServiceDate: formatDate(newDate)
                    });
                  } else {
                    console.log(`[Webhook] No pending assignment found for customer ${customer.id}.`);
                    await sendTextWhatsappMessage(
                      phoneNumber, 
                      `We couldn't find any pending service assignments for your number.`
                    );
                  }
                } else {
                  console.log(`[Webhook] No customer found in DB for phone: ${localPhone}`);
                  await sendTextWhatsappMessage(
                    phoneNumber, 
                    `Sorry, we couldn't find your number in our customer records.`
                  );
                }
              } else {
                console.log(`[Webhook] Matched date format but date is invalid: ${newDateString}`);
                await sendTextWhatsappMessage(
                  phoneNumber, 
                  `❌ Invalid date. Please reply in the format: YYYY-MM-DD`
                );
              }
            } else {
              console.log(`[Webhook] User asked to change date but no valid date found in text.`);
              // They typed "change date" but didn't provide a valid YYYY-MM-DD format
              await sendTextWhatsappMessage(
                phoneNumber, 
                `❌ We didn't understand the date format.\n\nPlease reply with your new date in this exact format: YYYY-MM-DD\nExample: 2026-07-20`
              );
            }
          } else {
             console.log(`[Webhook] Message ignored (not a date change request).`);
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
