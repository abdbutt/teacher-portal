"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClassroom } from "../api";
import { useToast } from "@/hooks/use-toast";

export function useDeleteClassroom(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteClassroom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Classroom Deleted",
        description: "The classroom and its roster have been removed.",
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Classroom",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
