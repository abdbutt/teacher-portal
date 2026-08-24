"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveTestResults } from "../api";
import { SaveTestResultsInput } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useSaveTestResults(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: SaveTestResultsInput) => saveTestResults(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["test-results", variables.testId] });
      queryClient.invalidateQueries({ queryKey: ["tests", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      toast({
        title: "Marks Saved Successfully",
        description: data.message || "Student results have been updated.",
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save Marks",
        description: error.message || "An unexpected error occurred while saving marks.",
        variant: "destructive",
      });
    },
  });
}
