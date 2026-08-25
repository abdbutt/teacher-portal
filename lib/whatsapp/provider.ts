import { WhatsAppDispatchResult, WhatsAppMessagePayload } from "./types";

export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppDispatchResult>;
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppDispatchResult> {
    // Log message for dev environment tracking
    console.log(`\n================ [WHATSAPP DISPATCH MOCK] ================`);
    console.log(`To: ${payload.to}`);
    console.log(`Payload:\n${payload.message}`);
    console.log(`===========================================================\n`);

    // Simulate network latency (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppDispatchResult> {
    try {
      let cleanTo = payload.to.trim();
      if (!cleanTo.startsWith("+") && !cleanTo.startsWith("whatsapp:")) {
        cleanTo = `+${cleanTo.replace(/[^0-9]/g, "")}`;
      }

      const from = this.fromNumber.startsWith("whatsapp:")
        ? this.fromNumber
        : `whatsapp:${this.fromNumber}`;

      const to = cleanTo.startsWith("whatsapp:")
        ? cleanTo
        : `whatsapp:${cleanTo}`;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const authHeader = `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`;

      const body = new URLSearchParams();
      body.append("To", to);
      body.append("From", from);
      body.append("Body", payload.message);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const resData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: resData.message || `HTTP error ${response.status}: ${JSON.stringify(resData)}`,
        };
      }

      return {
        success: true,
        messageId: resData.sid,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred during Twilio send",
      };
    }
  }
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Singleton WhatsApp provider instance configuration
export const whatsappProvider: WhatsAppProvider =
  accountSid && authToken && fromNumber
    ? new TwilioWhatsAppProvider(accountSid, authToken, fromNumber)
    : new MockWhatsAppProvider();
