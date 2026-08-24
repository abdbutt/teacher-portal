"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  Hash,
  Sparkles,
  AlertTriangle,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTestResults } from "../hooks/use-test-results";
import { useSaveTestResults } from "../hooks/use-save-test-results";
import { TestEntryItem } from "../types";

interface MarksEntryModalProps {
  test: TestEntryItem | null;
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StudentFormMark {
  studentId: string;
  studentName: string;
  rollNumber?: string | null;
  parentWhatsappNumber: string;
  obtainedMarksStr: string;
  remarks: string;
}

export function MarksEntryModal({
  test,
  classroomId,
  open,
  onOpenChange,
}: MarksEntryModalProps) {
  const testId = test?.id || null;
  const { data: testDetail, isLoading } = useTestResults(open ? testId : null);

  const [formMarks, setFormMarks] = useState<StudentFormMark[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (testDetail?.results) {
      const initial = testDetail.results.map((r) => ({
        studentId: r.studentId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        parentWhatsappNumber: r.parentWhatsappNumber,
        obtainedMarksStr:
          r.obtainedMarks !== null && r.obtainedMarks !== undefined
            ? String(r.obtainedMarks)
            : "",
        remarks: r.remarks || "",
      }));
      setFormMarks(initial);
      setValidationError(null);
    }
  }, [testDetail]);

  const { mutate: handleSaveMarks, isPending } = useSaveTestResults(
    classroomId,
    () => {
      onOpenChange(false);
    }
  );

  const handleClose = (newOpen: boolean) => {
    if (!isPending) {
      setValidationError(null);
      onOpenChange(newOpen);
    }
  };

  const handleMarkChange = (studentId: string, val: string) => {
    setFormMarks((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? { ...item, obtainedMarksStr: val }
          : item
      )
    );
    setValidationError(null);
  };

  const handleRemarkChange = (studentId: string, val: string) => {
    setFormMarks((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, remarks: val } : item
      )
    );
  };

  const handleQuickFillFull = () => {
    if (!test) return;
    setFormMarks((prev) =>
      prev.map((item) => ({
        ...item,
        obtainedMarksStr: String(test.totalMarks),
      }))
    );
  };

  const handleClearAll = () => {
    setFormMarks((prev) =>
      prev.map((item) => ({
        ...item,
        obtainedMarksStr: "",
        remarks: "",
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;

    // Validate marks
    const invalidRow = formMarks.find((item) => {
      if (!item.obtainedMarksStr.trim()) return true; // empty mark
      const num = Number(item.obtainedMarksStr);
      return isNaN(num) || num < 0 || num > test.totalMarks;
    });

    if (invalidRow) {
      if (!invalidRow.obtainedMarksStr.trim()) {
        setValidationError(
          `Please enter obtained marks for student "${invalidRow.studentName}".`
        );
      } else {
        setValidationError(
          `Marks for "${invalidRow.studentName}" must be between 0 and ${test.totalMarks}.`
        );
      }
      return;
    }

    const payload = formMarks.map((item) => ({
      studentId: item.studentId,
      obtainedMarks: Number(item.obtainedMarksStr),
      remarks: item.remarks.trim(),
    }));

    handleSaveMarks({
      testId: test.id,
      results: payload,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <FileSpreadsheet className="size-5" />
          </div>
          <DialogTitle className="text-xl">
            Enter Marks — {test?.subject}
          </DialogTitle>
          <DialogDescription>
            Record student marks out of <span className="font-semibold text-foreground">{test?.totalMarks}</span> for this test.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Quick Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/40 p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Pass Threshold: <strong className="text-foreground">50%</strong></span>
                <span>•</span>
                <span>{formMarks.length} Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickFillFull}
                  className="h-8 text-xs gap-1"
                >
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Fill Full Marks</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Marks Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">
              <Table className="min-w-[640px]">
                <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="w-10 text-center">#</TableHead>
                    <TableHead className="w-24">Roll No.</TableHead>
                    <TableHead className="min-w-[140px]">Student Name</TableHead>
                    <TableHead className="w-36">Obtained Marks</TableHead>
                    <TableHead className="w-24 text-center">% Percentage</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="min-w-[200px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formMarks.map((item, index) => {
                    const numVal = item.obtainedMarksStr !== "" ? Number(item.obtainedMarksStr) : null;
                    const isValidNum = numVal !== null && !isNaN(numVal) && numVal >= 0 && test ? numVal <= test.totalMarks : false;
                    const pct = isValidNum && test ? Math.round((numVal! / test.totalMarks) * 100 * 10) / 10 : null;
                    const isPassed = pct !== null ? pct >= 50 : null;

                    return (
                      <TableRow key={item.studentId} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {item.rollNumber ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-mono font-semibold text-primary">
                              <Hash className="size-3" />
                              {item.rollNumber}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {item.studentName}
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              max={test?.totalMarks}
                              placeholder={`0 - ${test?.totalMarks}`}
                              value={item.obtainedMarksStr}
                              onChange={(e) => handleMarkChange(item.studentId, e.target.value)}
                              disabled={isPending}
                              className="h-9 text-xs font-mono font-bold pr-12"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                              / {test?.totalMarks}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs font-bold">
                          {pct !== null ? `${pct}%` : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {isPassed === true ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              <CheckCircle2 className="size-3 mr-1" />
                              Pass
                            </Badge>
                          ) : isPassed === false ? (
                            <Badge variant="destructive" className="text-[10px]">
                              <XCircle className="size-3 mr-1" />
                              Fail
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add remark (optional)"
                            value={item.remarks}
                            onChange={(e) => handleRemarkChange(item.studentId, e.target.value)}
                            disabled={isPending}
                            className="h-9 text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {validationError && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving Marks...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Save Marks</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
