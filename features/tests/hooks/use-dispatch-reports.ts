"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dispatchTestReportCards } from "../api";
import { useToast } from "@/hooks/use-toast";

export function useDispatchReports(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (testId: string) => dispatchTestReportCards(testId),
    onSuccess: (data, testId) => {
      queryClient.invalidateQueries({ queryKey: ["test-results", testId] });
      queryClient.invalidateQueries({ queryKey: ["tests", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      toast({
        title: "Report Cards Dispatched! 🚀",
        description: data.message || `Sent report cards to ${data.dispatchedCount} parents via WhatsApp.`,
        variant: "success",
      });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Dispatch Failed",
        description: error.message || "An unexpected error occurred while sending WhatsApp report cards.",
        variant: "destructive",
      });
    },
  });
}
