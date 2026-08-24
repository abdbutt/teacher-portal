"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { batchCreateStudents } from "../api";
import { BatchStudentInput } from "../types";
import { useToast } from "@/hooks/use-toast";

interface BatchCreateStudentsParams {
  classroomId: string;
  students: BatchStudentInput[];
}

export function useBatchCreateStudents(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ students }: BatchCreateStudentsParams) =>
      batchCreateStudents(classroomId, students),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "CSV Import Successful",
        description: `Imported ${data.count} student(s) to the classroom roster.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "CSV Import Failed",
        description: error.message || "An unexpected error occurred during import.",
        variant: "destructive",
      });
    },
  });
}
