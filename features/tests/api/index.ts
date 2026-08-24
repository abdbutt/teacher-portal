import { CreateTestInput, TestEntryItem } from "../types";

export async function fetchTestsByClassroom(
  classroomId: string
): Promise<TestEntryItem[]> {
  const res = await fetch(`/api/tests?classroomId=${classroomId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch test entries");
  }
  return res.json();
}

export async function createTestEntry(
  input: CreateTestInput
): Promise<TestEntryItem> {
  const res = await fetch("/api/tests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create test entry");
  }

  return res.json();
}
