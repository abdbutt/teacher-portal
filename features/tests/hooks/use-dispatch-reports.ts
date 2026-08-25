"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dispatchTestReportCards } from "../api";
import { useToast } from "@/hooks/use-toast";

export function useDispatchReports(classroomId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ testId, studentIds }: { testId: string; studentIds?: string[] }) =>
      dispatchTestReportCards(testId, studentIds),
    onSuccess: (data, variables) => {
      const { testId } = variables;
      queryClient.invalidateQueries({ queryKey: ["test-results", testId] });
      queryClient.invalidateQueries({ queryKey: ["tests", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      const total = data.totalCount;
      const sent = data.dispatchedCount;
      const failed = total - sent;

      if (sent === 0 && total > 0) {
        toast({
          title: "Dispatch Failed ❌",
          description: "All messages failed to send. Please check your credentials and recipient number configurations.",
          variant: "destructive",
        });
      } else if (failed > 0) {
        toast({
          title: "Dispatched with Warnings ⚠️",
          description: `Successfully sent ${sent} report card(s), but ${failed} failed. Try checking numbers or click 'Retry Failed'.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Cards Dispatched! 🚀",
          description: `Successfully sent all ${sent} report card(s) via WhatsApp.`,
          variant: "success",
        });
      }

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
