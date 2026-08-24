export interface TestEntryItem {
  id: string;
  subject: string;
  totalMarks: number;
  date: string;
  classroomId: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface StudentResultItem {
  studentId: string;
  studentName: string;
  rollNumber?: string | null;
  parentWhatsappNumber: string;
  obtainedMarks: number | null;
  remarks?: string | null;
  messageStatus?: "PENDING" | "SENT" | "FAILED";
  percentage?: number | null;
  isPassed?: boolean | null;
}

export interface TestResultsDetailResponse {
  test: TestEntryItem;
  results: StudentResultItem[];
}

export interface SaveTestResultItem {
  studentId: string;
  obtainedMarks: number;
  remarks?: string;
}

export interface SaveTestResultsInput {
  testId: string;
  results: SaveTestResultItem[];
}
