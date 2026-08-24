import { ClassroomWithCount } from "../types";

export async function fetchClassrooms(): Promise<ClassroomWithCount[]> {
  const res = await fetch("/api/classrooms");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch classrooms");
  }
  return res.json();
}
