export interface TestEntryItem {
  id: string;
  subject: string;
  totalMarks: number;
  date: string;
  classroomId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    results: number;
  };
}

export interface CreateTestInput {
  subject: string;
  totalMarks: number;
  date: string;
  classroomId: string;
}

export interface StudentMarkItem {
  studentId: string;
  studentName: string;
  rollNumber?: string | null;
  parentWhatsappNumber: string;
  obtainedMarks: number | null;
  remarks?: string | null;
  messageStatus?: "PENDING" | "SENT" | "FAILED";
}

export interface SaveMarksInput {
  testEntryId: string;
  results: Array<{
    studentId: string;
    obtainedMarks: number;
    remarks?: string;
  }>;
}
