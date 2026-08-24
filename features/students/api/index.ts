import {
  BatchStudentInput,
  BatchStudentResponse,
  ClassroomDetail,
  CreateStudentInput,
  StudentRow,
  UpdateStudentInput,
} from "../types";

export async function fetchClassroomById(id: string): Promise<ClassroomDetail> {
  const res = await fetch(`/api/classrooms/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch classroom detail");
  }
  return res.json();
}

export async function createStudent(
  input: CreateStudentInput
): Promise<StudentRow> {
  const res = await fetch("/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to add student");
  }

  return res.json();
}

export async function updateStudent(
  id: string,
  input: UpdateStudentInput
): Promise<StudentRow> {
  const res = await fetch(`/api/students/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update student");
  }

  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`/api/students/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete student");
  }
}

export async function batchCreateStudents(
  classroomId: string,
  students: BatchStudentInput[]
): Promise<BatchStudentResponse> {
  const res = await fetch("/api/students/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ classroomId, students }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to import students batch");
  }

  return res.json();
}
