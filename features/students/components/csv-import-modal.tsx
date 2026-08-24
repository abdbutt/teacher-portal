"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import {
  FileUp,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { phoneE164Regex } from "../schemas";
import { CsvParsedRow, BatchStudentInput } from "../types";
import { useBatchCreateStudents } from "../hooks/use-batch-create-students";

interface CsvImportModalProps {
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvImportModal({
  classroomId,
  open,
  onOpenChange,
}: CsvImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<CsvParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const { mutate: handleBatchImport, isPending } = useBatchCreateStudents(
    classroomId,
    () => {
      handleReset();
      onOpenChange(false);
    }
  );

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!isPending) {
      handleReset();
      onOpenChange(newOpen);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "rollNumber,name,parentWhatsappNumber\n101,Aarav Sharma,+923001234567\n102,Sophia Chen,+14155552671\n103,Zain Malik,+923009876543\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_student_roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseError("Please select a valid CSV file (.csv).");
      return;
    }

    setSelectedFile(file);
    setParseError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setParseError("Failed to parse CSV file structure.");
          return;
        }

        const rows: CsvParsedRow[] = results.data.map((rawRow, idx) => {
          const rowIndex = idx + 1;
          const errors: string[] = [];

          // Header normalization (case insensitive & flexible keys)
          const keys = Object.keys(rawRow);
          const getKey = (possibleNames: string[]) => {
            const foundKey = keys.find((k) =>
              possibleNames.includes(k.toLowerCase().trim().replace(/[\_\-\s]+/g, ""))
            );
            return foundKey ? rawRow[foundKey]?.trim() : "";
          };

          const name = getKey(["name", "studentname", "fullname", "student"]);
          const parentWhatsappNumber = getKey([
            "parentwhatsappnumber",
            "parentwhatsapp",
            "whatsapp",
            "phone",
            "parentphone",
            "whatsappnumber",
            "contact",
          ]);
          const rollNumber = getKey(["rollnumber", "rollno", "roll", "id"]);

          if (!name || name.length < 2) {
            errors.push("Name must be at least 2 characters.");
          }

          if (!parentWhatsappNumber || !phoneE164Regex.test(parentWhatsappNumber)) {
            errors.push("Invalid WhatsApp number (must be E.164 e.g. +923001234567).");
          }

          return {
            rowIndex,
            rollNumber: rollNumber || undefined,
            name: name || "",
            parentWhatsappNumber: parentWhatsappNumber || "",
            isValid: errors.length === 0,
            errors,
          };
        });

        if (rows.length === 0) {
          setParseError("CSV file is empty.");
        } else {
          setParsedRows(rows);
        }
      },
      error: (err) => {
        setParseError(`Error parsing CSV: ${err.message}`);
      },
    });
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleSubmitImport = () => {
    if (validRows.length === 0) return;

    const payload: BatchStudentInput[] = validRows.map((r) => ({
      rollNumber: r.rollNumber,
      name: r.name,
      parentWhatsappNumber: r.parentWhatsappNumber,
    }));

    handleBatchImport({ classroomId, students: payload });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <FileUp className="size-5" />
          </div>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV roster file to add multiple students at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Top CSV Helper Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">Need a sample format?</p>
              <p className="text-xs text-muted-foreground">
                Headers should include: <code className="font-mono text-primary">rollNumber</code>, <code className="font-mono text-primary">name</code>, <code className="font-mono text-primary">parentWhatsappNumber</code>.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSampleCsv}
              className="gap-1.5 shrink-0"
            >
              <Download className="size-3.5" />
              <span>Download Template</span>
            </Button>
          </div>

          {/* File Picker Zone */}
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 bg-card/50 hover:bg-card rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
                <FileSpreadsheet className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Click to select CSV file</p>
                <p className="text-xs text-muted-foreground">Supports .csv files up to 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Bar */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <FileSpreadsheet className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{selectedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} total rows parsed
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  disabled={isPending}
                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {/* Status Summary Pill */}
              <div className="flex items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 className="size-3.5" />
                  <span>{validRows.length} Valid</span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-2.5 py-1 rounded-lg border border-destructive/20">
                    <XCircle className="size-3.5" />
                    <span>{invalidRows.length} Invalid (Will be skipped)</span>
                  </div>
                )}
              </div>

              {/* Parsed Rows Preview Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden max-h-56 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-10 text-center">#</TableHead>
                      <TableHead className="w-20">Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Parent WhatsApp</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow
                        key={row.rowIndex}
                        className={!row.isValid ? "bg-destructive/5" : ""}
                      >
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {row.rowIndex}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {row.rollNumber || "—"}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {row.name || <span className="text-destructive italic">Missing</span>}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {row.parentWhatsappNumber || (
                            <span className="text-destructive italic">Missing</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isValid ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]" title={row.errors.join("; ")}>
                              Invalid
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {parseError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmitImport}
            disabled={isPending || validRows.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <FileUp className="size-4" />
                <span>Import {validRows.length} Valid Student(s)</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
