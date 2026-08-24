export interface ClassroomWithCount {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    students: number;
    testEntries: number;
  };
}

export interface CreateClassroomInput {
  name: string;
}
