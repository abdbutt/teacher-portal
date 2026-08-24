export interface StudentRow {
  id: string;
  rollNumber?: string | null;
  name: string;
  parentWhatsappNumber: string;
  classroomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomDetail {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  students: StudentRow[];
  _count: {
    students: number;
    testEntries: number;
  };
}

export interface CreateStudentInput {
  rollNumber?: string;
  name: string;
  parentWhatsappNumber: string;
  classroomId: string;
}

export interface UpdateStudentInput {
  rollNumber?: string;
  name: string;
  parentWhatsappNumber: string;
}

export interface BatchStudentInput {
  rollNumber?: string;
  name: string;
  parentWhatsappNumber: string;
}

export interface BatchStudentResponse {
  count: number;
  message: string;
  skippedCount: number;
  validationErrors: string[];
}

export interface CsvParsedRow {
  rowIndex: number;
  rollNumber?: string;
  name: string;
  parentWhatsappNumber: string;
  isValid: boolean;
  errors: string[];
}
