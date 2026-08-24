"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClassroom } from "../api";
import { useToast } from "@/hooks/use-toast";

export function useCreateClassroom(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createClassroom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Classroom Created",
        description: `"${data.name}" has been created successfully.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Classroom",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
