"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  School,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  XCircle,
  Hash,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useClassroomDetail } from "@/features/students/hooks/use-classroom-detail";
import { useTestResults } from "../hooks/use-test-results";

interface PrintableReportCardProps {
  classroomId: string;
  testId: string;
}

export function PrintableReportCardView({
  classroomId,
  testId,
}: PrintableReportCardProps) {
  const { data: classroom, isLoading: isClassroomLoading } = useClassroomDetail(classroomId);
  const { data: testDetail, isLoading: isTestLoading } = useTestResults(testId);

  const [viewMode, setViewMode] = useState<"summary" | "slips">("summary");

  const isLoading = isClassroomLoading || isTestLoading;
  const test = testDetail?.test;
  const results = testDetail?.results || [];

  // Summary statistics
  const totalStudents = results.length;
  const recordedResults = results.filter((r) => r.obtainedMarks !== null);
  const passCount = recordedResults.filter((r) => r.isPassed).length;
  const failCount = recordedResults.filter((r) => r.isPassed === false).length;

  const totalObtainedSum = recordedResults.reduce(
    (acc, r) => acc + (r.obtainedMarks || 0),
    0
  );
  const classAveragePct =
    recordedResults.length > 0 && test?.totalMarks
      ? Math.round(
          (totalObtainedSum / (recordedResults.length * test.totalMarks)) *
            100 *
            10
        ) / 10
      : 0;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="mx-auto max-w-5xl px-4 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!test || !classroom) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="mx-auto max-w-5xl px-4 space-y-4 text-center">
          <h3 className="text-xl font-bold text-destructive">Report Card Not Found</h3>
          <Button asChild variant="outline">
            <Link href={`/dashboard/classrooms/${classroomId}`}>Return to Classroom</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(test.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground py-8 print:py-0 print:bg-white print:text-black">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6 print:px-0 print:max-w-none">
        {/* Screen Controls Header (Hidden during print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href={`/dashboard/classrooms/${classroomId}`}>
                <ArrowLeft className="size-4" />
                <span>Back to Classroom</span>
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-muted p-1 border border-border">
              <Button
                variant={viewMode === "summary" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("summary")}
                className="h-8 text-xs rounded-lg"
              >
                Class Summary Table
              </Button>
              <Button
                variant={viewMode === "slips" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("slips")}
                className="h-8 text-xs rounded-lg"
              >
                Individual Student Slips
              </Button>
            </div>

            <Button
              onClick={handlePrint}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Printer className="size-4" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* ======================================================================
            VIEW 1: CLASSROOM SUMMARY TABLE (Printable Document)
           ====================================================================== */}
        {viewMode === "summary" ? (
          <div className="space-y-6 bg-card print:bg-white rounded-2xl border border-border print:border-none p-6 sm:p-8 print:p-0 shadow-sm print:shadow-none">
            {/* Report Header */}
            <div className="border-b border-border print:border-slate-300 pb-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl print:text-xl font-bold tracking-tight text-foreground print:text-black">
                    {classroom.name}
                  </h1>
                  <p className="text-sm text-muted-foreground print:text-slate-600">
                    Official Examination & Test Performance Summary
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-xs font-mono font-bold bg-primary/10 border-primary/20 text-primary print:text-black print:border-slate-400">
                    {test.totalMarks} Total Marks
                  </Badge>
                  <p className="text-xs text-muted-foreground print:text-slate-600 block">{formattedDate}</p>
                </div>
              </div>

              {/* Subject Title */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary print:hidden">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground print:text-black">
                    Subject: {test.subject}
                  </h2>
                </div>
              </div>

              {/* Class Performance Key Metrics */}
              <div className="grid grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border border-border print:border-slate-300 p-3 text-center bg-muted/30 print:bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground print:text-slate-600">Enrolled</span>
                  <p className="text-lg font-bold text-foreground print:text-black">{totalStudents}</p>
                </div>
                <div className="rounded-xl border border-border print:border-slate-300 p-3 text-center bg-muted/30 print:bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground print:text-slate-600">Passed</span>
                  <p className="text-lg font-bold text-emerald-600 print:text-black">{passCount}</p>
                </div>
                <div className="rounded-xl border border-border print:border-slate-300 p-3 text-center bg-muted/30 print:bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground print:text-slate-600">Failed</span>
                  <p className="text-lg font-bold text-destructive print:text-black">{failCount}</p>
                </div>
                <div className="rounded-xl border border-border print:border-slate-300 p-3 text-center bg-muted/30 print:bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground print:text-slate-600">Class Average</span>
                  <p className="text-lg font-bold text-primary print:text-black">{classAveragePct}%</p>
                </div>
              </div>
            </div>

            {/* Performance Results Table */}
            <div className="overflow-hidden rounded-xl border border-border print:border-slate-300">
              <Table>
                <TableHeader className="bg-muted/60 print:bg-slate-100">
                  <TableRow>
                    <TableHead className="w-12 text-center print:text-black">#</TableHead>
                    <TableHead className="w-24 print:text-black">Roll No.</TableHead>
                    <TableHead className="print:text-black">Student Name</TableHead>
                    <TableHead className="w-32 text-center print:text-black">Obtained Marks</TableHead>
                    <TableHead className="w-24 text-center print:text-black">% Percentage</TableHead>
                    <TableHead className="w-24 text-center print:text-black">Status</TableHead>
                    <TableHead className="print:text-black">Teacher Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item, idx) => (
                    <TableRow key={item.studentId} className="print:border-slate-300">
                      <TableCell className="text-center text-xs text-muted-foreground print:text-black">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold print:text-black">
                        {item.rollNumber ? `#${item.rollNumber}` : "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-foreground print:text-black">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs print:text-black">
                        {item.obtainedMarks !== null ? `${item.obtainedMarks} / ${test.totalMarks}` : "—"}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs print:text-black">
                        {item.percentage !== null ? `${item.percentage}%` : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.isPassed === true ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] print:bg-transparent print:border-slate-400 print:text-black">
                            Pass
                          </Badge>
                        ) : item.isPassed === false ? (
                          <Badge variant="destructive" className="text-[10px] print:bg-transparent print:border-slate-400 print:text-black">
                            Fail
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground print:text-black">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground print:text-black">
                        {item.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer Signatures for Official Printouts */}
            <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs font-medium text-muted-foreground print:text-black">
              <div>
                <div className="border-t border-dashed border-border print:border-slate-400 pt-2 w-48 mx-auto">
                  Teacher Signature
                </div>
              </div>
              <div>
                <div className="border-t border-dashed border-border print:border-slate-400 pt-2 w-48 mx-auto">
                  Principal / Stamp
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================================
              VIEW 2: INDIVIDUAL STUDENT REPORT CARDS (Page-Break printable slips)
             ====================================================================== */
          <div className="space-y-8">
            {results.map((item, idx) => (
              <div
                key={item.studentId}
                className="bg-card print:bg-white rounded-2xl border border-border print:border-slate-300 p-6 sm:p-8 shadow-sm print:shadow-none space-y-6 print:break-after-page page-break-after"
              >
                {/* Report Card Header */}
                <div className="border-b border-border print:border-slate-300 pb-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-primary font-bold tracking-wide uppercase">
                      <School className="size-4" />
                      <span>{classroom.name}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground print:text-black mt-1">
                      ACADEMIC REPORT CARD
                    </h2>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs font-mono font-bold">
                      {test.subject}
                    </Badge>
                    <p className="text-xs text-muted-foreground print:text-slate-600 block mt-1">
                      Date: {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-xl bg-muted/40 print:bg-slate-50 border border-border print:border-slate-300 p-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Student Name</span>
                    <p className="text-sm font-bold text-foreground print:text-black">{item.studentName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Roll Number</span>
                    <p className="text-sm font-bold font-mono text-foreground print:text-black">
                      {item.rollNumber ? `#${item.rollNumber}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Parent Contact</span>
                    <p className="text-sm font-bold font-mono text-foreground print:text-black">
                      {item.parentWhatsappNumber}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border print:border-slate-300 p-4 text-center">
                    <span className="text-xs font-semibold text-muted-foreground">Marks Obtained</span>
                    <p className="text-2xl font-bold text-foreground print:text-black mt-1 font-mono">
                      {item.obtainedMarks !== null ? item.obtainedMarks : "—"} / {test.totalMarks}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border print:border-slate-300 p-4 text-center">
                    <span className="text-xs font-semibold text-muted-foreground">Percentage</span>
                    <p className="text-2xl font-bold text-primary print:text-black mt-1 font-mono">
                      {item.percentage !== null ? `${item.percentage}%` : "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border print:border-slate-300 p-4 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">Status</span>
                    <div className="mt-1">
                      {item.isPassed === true ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1">
                          <CheckCircle2 className="size-3.5 mr-1" />
                          PASSED
                        </Badge>
                      ) : item.isPassed === false ? (
                        <Badge variant="destructive" className="text-xs px-3 py-1">
                          <XCircle className="size-3.5 mr-1" />
                          NEEDS IMPROVEMENT
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="rounded-xl border border-border print:border-slate-300 p-4 space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Teacher Remarks
                  </span>
                  <p className="text-xs italic text-foreground print:text-black">
                    "{item.remarks || "No additional remarks logged."}"
                  </p>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs font-medium text-muted-foreground print:text-black">
                  <div>
                    <div className="border-t border-dashed border-border print:border-slate-400 pt-2 w-40 mx-auto">
                      Teacher Signature
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-dashed border-border print:border-slate-400 pt-2 w-40 mx-auto">
                      Parent Signature
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
