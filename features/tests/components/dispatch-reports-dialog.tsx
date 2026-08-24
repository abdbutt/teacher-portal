"use client";

import { Send, Loader2, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTestResults } from "../hooks/use-test-results";
import { useDispatchReports } from "../hooks/use-dispatch-reports";
import { TestEntryItem } from "../types";

interface DispatchReportsDialogProps {
  test: TestEntryItem | null;
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DispatchReportsDialog({
  test,
  classroomId,
  open,
  onOpenChange,
}: DispatchReportsDialogProps) {
  const testId = test?.id || null;
  const { data: testDetail, isLoading: isResultsLoading } = useTestResults(
    open ? testId : null
  );

  const { mutate: handleDispatch, isPending } = useDispatchReports(
    classroomId,
    () => {
      onOpenChange(false);
    }
  );

  const recordedResults = testDetail?.results || [];
  const validCount = recordedResults.filter((r) => r.obtainedMarks !== null).length;
  const isNoResults = validCount === 0;

  const sampleStudent = recordedResults.find((r) => r.obtainedMarks !== null);
  const formattedDate = test?.date
    ? new Date(test.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const previewMessage = sampleStudent
    ? `🎓 *STUDENT ACADEMIC REPORT CARD*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 *Class:* Grade 10 - Section A
👤 *Student:* ${sampleStudent.studentName}${
        sampleStudent.rollNumber ? ` (Roll: #${sampleStudent.rollNumber})` : ""
      }
📚 *Subject:* ${test?.subject}
📅 *Test Date:* ${formattedDate}

📊 *PERFORMANCE OVERVIEW*
• Marks Obtained: *${sampleStudent.obtainedMarks} / ${test?.totalMarks}*
• Percentage: *${sampleStudent.percentage}%*
• Result Status: ${sampleStudent.isPassed ? "✅ *PASS*" : "⚠️ *NEEDS IMPROVEMENT*"}

📝 *Teacher Remarks:*
"${sampleStudent.remarks || "Keep up the hard work!"}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Sent via TeacherPortal Automated System_`
    : "";

  const handleConfirmDispatch = () => {
    if (testId) {
      handleDispatch(testId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-2">
            <MessageSquare className="size-5" />
          </div>
          <DialogTitle>Dispatch WhatsApp Report Cards</DialogTitle>
          <DialogDescription>
            Send instant WhatsApp academic report cards to parent phone numbers for{" "}
            <span className="font-semibold text-foreground">{test?.subject}</span>.
          </DialogDescription>
        </DialogHeader>

        {isResultsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : isNoResults ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-center">
            <AlertCircle className="size-6 text-destructive mx-auto" />
            <h4 className="font-semibold text-sm text-destructive">No Marks Recorded</h4>
            <p className="text-xs text-muted-foreground">
              Please click "Enter Marks" to log student scores before dispatching WhatsApp report cards.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient Count Banner */}
            <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Ready to send to <strong>{validCount}</strong> parent phone numbers</span>
              </div>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-700 border-emerald-300">
                WhatsApp Active
              </Badge>
            </div>

            {/* Template Message Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sample Message Preview
              </label>
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-[11px] font-mono whitespace-pre-wrap text-foreground/90 max-h-52 overflow-y-auto leading-relaxed shadow-inner">
                {previewMessage}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDispatch}
            disabled={isPending || isNoResults || isResultsLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Send WhatsApp Reports ({validCount})</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
