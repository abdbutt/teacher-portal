"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClassrooms } from "../api";

export function useClassrooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: fetchClassrooms,
  });
}
