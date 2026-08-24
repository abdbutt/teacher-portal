"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTestsByClassroom } from "../api";

export function useClassroomTests(classroomId: string) {
  return useQuery({
    queryKey: ["tests", classroomId],
    queryFn: () => fetchTestsByClassroom(classroomId),
    enabled: Boolean(classroomId),
  });
}
