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

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppDispatchResult> {
    try {
      // Meta API requires digits only with country code (no plus sign +)
      const cleanTo = payload.to.replace(/[^0-9]/g, "");

      const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanTo,
          type: "text",
          text: {
            preview_url: false,
            body: payload.message,
          },
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: resData.error?.message || `HTTP error ${response.status}: ${JSON.stringify(resData)}`,
        };
      }

      return {
        success: true,
        messageId: resData.messages?.[0]?.id || `meta_wa_${Date.now()}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred during Meta Cloud API send",
      };
    }
  }
}

const metaAccessToken = process.env.META_ACCESS_TOKEN;
const metaPhoneNumberId = process.env.META_PHONE_NUMBER_ID;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Singleton WhatsApp provider selection logic
export const whatsappProvider: WhatsAppProvider = (() => {
  if (metaAccessToken && metaPhoneNumberId) {
    console.log("[WHATSAPP INTERACTION] Active Provider: META Cloud API");
    return new MetaWhatsAppProvider(metaAccessToken, metaPhoneNumberId);
  }
  if (accountSid && authToken && fromNumber) {
    console.log("[WHATSAPP INTERACTION] Active Provider: Twilio API Gateway");
    return new TwilioWhatsAppProvider(accountSid, authToken, fromNumber);
  }
  console.log("[WHATSAPP INTERACTION] Active Provider: MOCK Fallback (Console Logs)");
  return new MockWhatsAppProvider();
})();
