export interface StudentRow {
  id: string;
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
  name: string;
  parentWhatsappNumber: string;
  classroomId: string;
}

export interface UpdateStudentInput {
  name: string;
  parentWhatsappNumber: string;
}
