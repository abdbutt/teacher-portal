"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStudent } from "../api";
import { useToast } from "@/hooks/use-toast";

export function useDeleteStudent(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Student Removed",
        description: "Student has been removed from the classroom roster.",
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Remove Student",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
