"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClassroomById } from "../api";

export function useClassroomDetail(id: string) {
  return useQuery({
    queryKey: ["classrooms", id],
    queryFn: () => fetchClassroomById(id),
    enabled: Boolean(id),
  });
}
