"use client";

import { Users, Phone, MoreVertical, Pencil, Trash2, Hash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StudentRow } from "../types";

interface StudentTableProps {
  students: StudentRow[];
  onEditStudent: (student: StudentRow) => void;
  onDeleteStudent: (student: StudentRow) => void;
}

export function StudentTable({
  students,
  onEditStudent,
  onDeleteStudent,
}: StudentTableProps) {
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead className="w-28">Roll No.</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Parent WhatsApp Number</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Enrolled Date</TableHead>
            <TableHead className="w-12 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="text-center font-medium text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                {student.rollNumber ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <Hash className="size-3" />
                    <span>{student.rollNumber}</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">—</span>
                )}
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
              <TableCell className="hidden sm:table-cell text-right text-xs text-muted-foreground">
                {new Date(student.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEditStudent(student)}>
                      <Pencil className="size-4 text-muted-foreground" />
                      <span>Edit Student</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDeleteStudent(student)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      <span>Remove</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
