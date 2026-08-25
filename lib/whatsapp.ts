import { whatsappProvider } from "./whatsapp/provider";
import { formatReportCardMessage } from "./whatsapp/template";

/**
 * Sends a WhatsApp message via the configured API provider (Twilio).
 * Fallbacks to Mock provider if credentials are not configured.
 */
export async function sendWhatsAppAPI(to: string, message: string) {
  return whatsappProvider.sendMessage({
    to,
    message,
  });
}

/**
 * Generates a direct one-click WhatsApp Web deep link (wa.me) for zero-cost parent messaging.
 */
export function generateWhatsAppWebLink(
  to: string,
  studentName: string,
  subject: string,
  obtained: number,
  total: number,
  remarks?: string | null,
  rollNumber?: string | null,
  className?: string
): string {
  const cleanPhone = to.replace(/[^0-9]/g, "");

  const percentage = total > 0 ? Math.round((obtained / total) * 100 * 10) / 10 : 0;
  const isPassed = percentage >= 50;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const message = formatReportCardMessage({
    schoolOrClassName: className || "Classroom",
    studentName,
    rollNumber,
    parentWhatsappNumber: to,
    subject,
    testDate: formattedDate,
    obtainedMarks: obtained,
    totalMarks: total,
    percentage,
    isPassed,
    remarks,
  });

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
