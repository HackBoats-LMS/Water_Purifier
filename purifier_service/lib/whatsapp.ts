
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN_PERMENENT;
export async function sendAssignmentWhatsappMessage(data:WhatsappData){
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `91${data.CustomerPhoneNumber}`,
        type: "template",
        template: {
          name: "purifierservice",
          language: {
            code: "en"
          },
          components: [{
            type: "body",
            parameters: [
              {
                type: "text",
                text: `${data.CustomerName}`
              },
              {
                type: "text",
                text: `${data.ServiceDate}`
              },
              {
                type: "text",
                text: `${data.WorkerName}`
              },
              {
                type: "text",
                text: `${data.WorkerContact}`
              },
              {
                type: "text",
                text: `${process.env.SUPPORT_PHONE_NUMBER}`
              }
            
            ]
        }
        ]
        }
      })

    })

    const result = await response.json();
    if(!response.ok){
        console.log("WhatsApp Error:",result);
    }
    console.log("WhatsApp Message Sent:",result);
        
    } catch (error) {
        console.log(error);
    }

}

type WhatsappData={
    CustomerName: string;
    CustomerPhoneNumber: string;
    WorkerName: string;
    WorkerContact: string;
    ServiceDate: string;
}

export async function sendTextWhatsappMessage(to: string, messageText: string) {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        return;
    }
    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: to, // The API expects the number in format like '91xxxx'
                type: "text",
                text: {
                    body: messageText
                }
            })
        });

        const result = await response.json();
        if (!response.ok) {
            console.error("WhatsApp Text Error:", result);
        }
        console.log("WhatsApp Text Sent:", result);
    } catch (error) {
        console.error(error);
    }
}