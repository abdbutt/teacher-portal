import { ClassroomDetail } from "../types";

export async function fetchClassroomById(id: string): Promise<ClassroomDetail> {
  const res = await fetch(`/api/classrooms/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch classroom detail");
  }
  return res.json();
}
