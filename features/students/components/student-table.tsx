"use client";

import { Users, Phone, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StudentRow } from "../types";

interface StudentTableProps {
  students: StudentRow[];
  onOpenAddStudent?: () => void;
  onOpenImportCsv?: () => void;
}

export function StudentTable({ students }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center space-y-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Users className="size-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">No students enrolled yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Add your first student manually or upload a CSV roster file to populate this classroom.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead>Student Name</TableHead>
          <TableHead>Parent WhatsApp Number</TableHead>
          <TableHead className="text-right">Enrolled Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student, index) => (
          <TableRow key={student.id}>
            <TableCell className="text-center font-medium text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-semibold text-foreground">
              {student.name}
            </TableCell>
            <TableCell>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                <Phone className="size-3.5" />
                <span>{student.parentWhatsappNumber}</span>
              </div>
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {new Date(student.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
