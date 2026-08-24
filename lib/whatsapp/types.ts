export interface ReportCardData {
  schoolOrClassName: string;
  studentName: string;
  rollNumber?: string | null;
  parentWhatsappNumber: string;
  subject: string;
  testDate: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  remarks?: string | null;
}

export interface WhatsAppMessagePayload {
  to: string;
  message: string;
  studentId?: string;
  testEntryId?: string;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
