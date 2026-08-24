"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  FileSpreadsheet,
  Plus,
  FileUp,
  AlertCircle,
  School,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClassroomDetail } from "../hooks/use-classroom-detail";
import { StudentTable } from "./student-table";
import { AddStudentModal } from "./add-student-modal";
import { EditStudentModal } from "./edit-student-modal";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { CsvImportModal } from "./csv-import-modal";
import { StudentRow } from "../types";

import { useClassroomTests } from "@/features/tests/hooks/use-classroom-tests";
import { TestList } from "@/features/tests/components/test-list";
import { CreateTestModal } from "@/features/tests/components/create-test-modal";
import { TestEntryItem } from "@/features/tests/types";

interface ClassroomDetailProps {
  classroomId: string;
}

export function ClassroomDetail({ classroomId }: ClassroomDetailProps) {
  const { data: classroom, isLoading, isError, error } = useClassroomDetail(classroomId);
  const { data: tests = [], isLoading: isTestsLoading } = useClassroomTests(classroomId);

  const [activeTab, setActiveTab] = useState<"students" | "tests">("students");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentRow | null>(null);

  const handleEnterMarks = (test: TestEntryItem) => {
    // Stub for Step 4.2 - Marks Entry Form / Sheet
    alert(`Step 4.2: Enter marks for test "${test.subject}"`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
            <AlertCircle className="size-10 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-destructive">Classroom Not Found</h3>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "The requested classroom could not be found or access is denied."}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Return to Classroom Roster</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              <span>Back to Classrooms</span>
            </Link>
          </Button>
        </div>

        {/* Classroom Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <School className="size-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{classroom.name}</h1>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pl-1">
              <div className="flex items-center gap-1.5">
                <Users className="size-4" />
                <span>{classroom._count.students} Enrolled Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="size-4" />
                <span>{tests.length} Recorded Tests</span>
              </div>
            </div>
          </div>

          {/* Classroom Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === "students" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsImportCsvOpen(true)}
                  className="gap-2"
                >
                  <FileUp className="size-4" />
                  <span>Import CSV</span>
                </Button>
                <Button onClick={() => setIsAddStudentOpen(true)} className="gap-2">
                  <Plus className="size-4" />
                  <span>Add Student</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsCreateTestOpen(true)} className="gap-2">
                <Plus className="size-4" />
                <span>Create Test Entry</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Selection Bar */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "students" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("students")}
              className="gap-2 rounded-xl"
            >
              <Users className="size-4" />
              <span>Enrolled Students ({classroom.students.length})</span>
            </Button>

            <Button
              variant={activeTab === "tests" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("tests")}
              className="gap-2 rounded-xl"
            >
              <ClipboardList className="size-4" />
              <span>Test Entries ({tests.length})</span>
            </Button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "students" ? (
          <div className="space-y-4">
            <StudentTable
              students={classroom.students}
              onEditStudent={(student) => setEditingStudent(student)}
              onDeleteStudent={(student) => setDeletingStudent(student)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {isTestsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-44 w-full rounded-2xl" />
              </div>
            ) : (
              <TestList
                tests={tests}
                totalStudentsCount={classroom.students.length}
                onCreateTest={() => setIsCreateTestOpen(true)}
                onEnterMarks={handleEnterMarks}
              />
            )}
          </div>
        )}

        {/* Modals & Dialogs */}
        <AddStudentModal
          classroomId={classroomId}
          open={isAddStudentOpen}
          onOpenChange={setIsAddStudentOpen}
        />

        <CsvImportModal
          classroomId={classroomId}
          open={isImportCsvOpen}
          onOpenChange={setIsImportCsvOpen}
        />

        <CreateTestModal
          classroomId={classroomId}
          open={isCreateTestOpen}
          onOpenChange={setIsCreateTestOpen}
        />

        <EditStudentModal
          student={editingStudent}
          classroomId={classroomId}
          open={Boolean(editingStudent)}
          onOpenChange={(open) => !open && setEditingStudent(null)}
        />

        <DeleteStudentDialog
          student={deletingStudent}
          classroomId={classroomId}
          open={Boolean(deletingStudent)}
          onOpenChange={(open) => !open && setDeletingStudent(null)}
        />
      </div>
    </div>
  );
}
