"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Loader2,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  FileSpreadsheet
} from "lucide-react";
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
import { dispatchTestReportCards } from "../api";
import { TestEntryItem } from "../types";
import { useToast } from "@/hooks/use-toast";

interface DispatchReportsDialogProps {
  test: TestEntryItem | null;
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DispatchStatus = "PENDING" | "SENDING" | "SENT" | "FAILED";

export function DispatchReportsDialog({
  test,
  classroomId,
  open,
  onOpenChange,
}: DispatchReportsDialogProps) {
  const testId = test?.id || null;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: testDetail, isLoading: isResultsLoading } = useTestResults(
    open ? testId : null
  );

  const recordedResults = testDetail?.results || [];
  const validResults = recordedResults.filter((r) => r.obtainedMarks !== null);
  const isNoResults = validResults.length === 0;

  // Dispatch States indexed by studentId
  const [statuses, setStatuses] = useState<Record<string, DispatchStatus>>({});
  const [isDispatching, setIsDispatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSendingName, setCurrentSendingName] = useState<string | null>(null);

  // Sync statuses from database state when loaded or modal opens
  useEffect(() => {
    if (open && validResults.length > 0) {
      const initial: Record<string, DispatchStatus> = {};
      validResults.forEach((r) => {
        initial[r.studentId] = (r.messageStatus as DispatchStatus) || "PENDING";
      });
      setStatuses(initial);
      setProgress(0);
      setCurrentSendingName(null);
    }
  }, [open, testDetail]);

  const handleStartDispatch = async (targets: typeof validResults) => {
    if (targets.length === 0) return;

    setIsDispatching(true);
    setProgress(0);

    // Set initial active state to PENDING/SENDING in status map
    setStatuses((prev) => {
      const next = { ...prev };
      targets.forEach((r) => {
        next[r.studentId] = "PENDING";
      });
      return next;
    });

    const batchSize = 5;
    let completed = 0;
    const finalStatuses: Record<string, "SENT" | "FAILED"> = {};

    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);

      // Set current batch to SENDING
      setStatuses((prev) => {
        const next = { ...prev };
        batch.forEach((r) => {
          next[r.studentId] = "SENDING";
        });
        return next;
      });

      // Update ticker name to first student in the batch
      setCurrentSendingName(batch.map((b) => b.studentName).join(", "));

      // Execute dispatch parallelly for this batch of 5
      await Promise.all(
        batch.map(async (result) => {
          try {
            const res = await dispatchTestReportCards(testId!, [result.studentId]);
            if (res.success && res.dispatchedCount > 0) {
              finalStatuses[result.studentId] = "SENT";
              setStatuses((prev) => ({ ...prev, [result.studentId]: "SENT" }));
            } else {
              finalStatuses[result.studentId] = "FAILED";
              setStatuses((prev) => ({ ...prev, [result.studentId]: "FAILED" }));
            }
          } catch (e) {
            finalStatuses[result.studentId] = "FAILED";
            setStatuses((prev) => ({ ...prev, [result.studentId]: "FAILED" }));
          } finally {
            completed++;
            setProgress(Math.round((completed / targets.length) * 100));
          }
        })
      );
    }

    setIsDispatching(false);
    setCurrentSendingName(null);

    // Sync database caches
    queryClient.invalidateQueries({ queryKey: ["test-results", testId] });
    queryClient.invalidateQueries({ queryKey: ["tests", classroomId] });

    // Toast result sum based on accurate final statuses tracker
    const totalCount = targets.length;
    const actualFailedCount = Object.values(finalStatuses).filter((s) => s === "FAILED").length;
    const actualSentCount = totalCount - actualFailedCount;

    if (actualSentCount === 0 && totalCount > 0) {
      toast({
        title: "Dispatch Failed ❌",
        description: "All messages failed to send. Please check your credentials and numbers.",
        variant: "destructive",
      });
    } else if (actualFailedCount > 0) {
      toast({
        title: "Dispatched with Warnings ⚠️",
        description: `Successfully sent ${actualSentCount} report card(s), but ${actualFailedCount} failed. Click 'Retry Failed' to dispatch remaining.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reports Dispatched! 🚀",
        description: "Successfully sent all report cards to parents via WhatsApp.",
        variant: "success",
      });
    }
  };

  const sentCount = Object.values(statuses).filter((s) => s === "SENT").length;
  const failedCount = Object.values(statuses).filter((s) => s === "FAILED").length;
  const pendingCount = Object.values(statuses).filter((s) => s === "PENDING").length;

  return (
    <Dialog open={open} onOpenChange={(val) => !isDispatching && onOpenChange(val)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-2">
            <MessageSquare className="size-5" />
          </div>
          <DialogTitle>Automated Report Card Campaign</DialogTitle>
          <DialogDescription>
            Send instant WhatsApp report cards automatically to parents for{" "}
            <span className="font-semibold text-foreground">{test?.subject}</span>.
          </DialogDescription>
        </DialogHeader>

        {isResultsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : isNoResults ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-3 text-center">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <h4 className="font-semibold text-sm text-destructive">No Marks Logged</h4>
            <p className="text-xs text-muted-foreground">
              Add student marks for this test entry before trying to execute a message dispatch campaign.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Real-time progress bar layout */}
            {(isDispatching || progress > 0) && (
              <div className="space-y-2 border border-border bg-muted/30 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    {isDispatching ? (
                      <Loader2 className="size-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    )}
                    {isDispatching ? "Sending report cards..." : "Campaign Completed"}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isDispatching && currentSendingName && (
                  <p className="text-[10px] text-muted-foreground truncate italic">
                    Active: {currentSendingName}
                  </p>
                )}
              </div>
            )}

            {/* Micro Stats Row */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className="rounded-xl border border-border bg-card p-2">
                <div className="text-muted-foreground text-[10px] uppercase">Students</div>
                <div className="text-sm font-bold">{validResults.length}</div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2 text-emerald-700">
                <div className="text-[10px] uppercase">Sent</div>
                <div className="text-sm font-bold">{sentCount}</div>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-2 text-destructive">
                <div className="text-[10px] uppercase">Failed</div>
                <div className="text-sm font-bold">{failedCount}</div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                <div className="text-[10px] uppercase">Pending</div>
                <div className="text-sm font-bold">{pendingCount}</div>
              </div>
            </div>

            {/* Scrollable Student List Monitor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Recipients Dispatch Monitor
              </label>
              <div className="rounded-2xl border border-border bg-card/60 p-1 max-h-60 overflow-y-auto divide-y divide-border text-xs shadow-inner">
                {validResults.map((result) => {
                  const status = statuses[result.studentId] || "PENDING";
                  return (
                    <div
                      key={result.studentId}
                      className="flex items-center justify-between py-2 px-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="font-semibold text-foreground truncate">
                          {result.studentName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {result.parentWhatsappNumber} • Marks: {result.obtainedMarks}/{test?.totalMarks}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {status === "SENT" && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 gap-1 pr-2 py-0.5">
                            <Check className="size-3 text-emerald-600" />
                            Sent
                          </Badge>
                        )}
                        {status === "FAILED" && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 pr-2 py-0.5">
                            <X className="size-3 text-destructive" />
                            Failed
                          </Badge>
                        )}
                        {status === "SENDING" && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 gap-1 pr-2 py-0.5">
                            <Loader2 className="size-3 animate-spin text-blue-600" />
                            Sending
                          </Badge>
                        )}
                        {status === "PENDING" && (
                          <Badge variant="outline" className="text-muted-foreground border-border py-0.5">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border mt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDispatching}
          >
            Close
          </Button>

          {failedCount > 0 && !isNoResults && !isResultsLoading && (
            <Button
              onClick={() => handleStartDispatch(validResults.filter((r) => statuses[r.studentId] === "FAILED"))}
              disabled={isDispatching}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Retry Failed ({failedCount})</span>
            </Button>
          )}

          {pendingCount > 0 && !isNoResults && !isResultsLoading && (
            <Button
              onClick={() => handleStartDispatch(validResults.filter((r) => statuses[r.studentId] === "PENDING"))}
              disabled={isDispatching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Send className="size-4" />
              <span>Send Pending ({pendingCount})</span>
            </Button>
          )}

          {pendingCount === 0 && !isNoResults && !isResultsLoading && (
            <Button
              onClick={() => handleStartDispatch(validResults)}
              disabled={isDispatching}
              className="bg-secondary hover:bg-secondary/80 text-foreground gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Force Re-send All ({validResults.length})</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
