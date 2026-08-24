import {
  CreateTestInput,
  SaveTestResultsInput,
  TestEntryItem,
  TestResultsDetailResponse,
} from "../types";

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

export async function fetchTestResults(
  testId: string
): Promise<TestResultsDetailResponse> {
  const res = await fetch(`/api/tests/${testId}/results`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch test results");
  }
  return res.json();
}

export async function saveTestResults(
  input: SaveTestResultsInput
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/tests/${input.testId}/results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ results: input.results }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save test results");
  }

  return res.json();
}

export async function dispatchTestReportCards(
  testId: string
): Promise<{ success: boolean; message: string; dispatchedCount: number; totalCount: number }> {
  const res = await fetch(`/api/tests/${testId}/dispatch`, {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to dispatch WhatsApp report cards");
  }

  return res.json();
}
