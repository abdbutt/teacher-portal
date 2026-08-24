"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClassroom } from "../api";
import { CreateClassroomInput } from "../types";
import { useToast } from "@/hooks/use-toast";

interface UpdateClassroomParams {
  id: string;
  input: CreateClassroomInput;
}

export function useUpdateClassroom(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: UpdateClassroomParams) =>
      updateClassroom(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Classroom Updated",
        description: `"${data.name}" has been updated successfully.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Classroom",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });
}
