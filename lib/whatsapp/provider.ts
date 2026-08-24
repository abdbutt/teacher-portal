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

// Singleton WhatsApp provider instance
export const whatsappProvider: WhatsAppProvider = new MockWhatsAppProvider();
