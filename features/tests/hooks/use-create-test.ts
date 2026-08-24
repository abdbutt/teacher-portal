"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTestEntry } from "../api";
import { CreateTestInput } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useCreateTest(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateTestInput) => createTestEntry(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tests", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Test Entry Created",
        description: `"${data.subject}" test (Total: ${data.totalMarks} marks) created successfully.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Test",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
