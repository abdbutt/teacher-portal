"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStudent } from "../api";
import { UpdateStudentInput } from "../types";
import { useToast } from "@/hooks/use-toast";

interface UpdateStudentParams {
  id: string;
  input: UpdateStudentInput;
}

export function useUpdateStudent(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: UpdateStudentParams) =>
      updateStudent(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      toast({
        title: "Student Updated",
        description: `"${data.name}"'s information has been updated.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Student",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
