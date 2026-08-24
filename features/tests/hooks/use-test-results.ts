"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTestResults } from "../api";

export function useTestResults(testId: string | null) {
  return useQuery({
    queryKey: ["test-results", testId],
    queryFn: () => (testId ? fetchTestResults(testId) : null),
    enabled: Boolean(testId),
  });
}
