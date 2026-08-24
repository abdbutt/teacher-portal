"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudent } from "../api";
import { CreateStudentInput } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useCreateStudent(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateStudentInput) => createStudent(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Student Added",
        description: `"${data.name}" has been added to the roster.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Student",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
