import { ClassroomWithCount, CreateClassroomInput } from "../types";

export async function fetchClassrooms(): Promise<ClassroomWithCount[]> {
  const res = await fetch("/api/classrooms");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch classrooms");
  }
  return res.json();
}

export async function createClassroom(
  input: CreateClassroomInput
): Promise<ClassroomWithCount> {
  const res = await fetch("/api/classrooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create classroom");
  }

  return res.json();
}

export async function updateClassroom(
  id: string,
  input: CreateClassroomInput
): Promise<ClassroomWithCount> {
  const res = await fetch(`/api/classrooms/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update classroom");
  }

  return res.json();
}

export async function deleteClassroom(id: string): Promise<void> {
  const res = await fetch(`/api/classrooms/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete classroom");
  }
}
