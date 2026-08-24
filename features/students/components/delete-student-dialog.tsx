"use client";

import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteStudent } from "../hooks/use-delete-student";
import { StudentRow } from "../types";

interface DeleteStudentDialogProps {
  student: StudentRow | null;
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteStudentDialog({
  student,
  classroomId,
  open,
  onOpenChange,
}: DeleteStudentDialogProps) {
  const { mutate: handleDeleteStudent, isPending } = useDeleteStudent(
    classroomId,
    () => {
      onOpenChange(false);
    }
  );

  const onConfirm = () => {
    if (student) {
      handleDeleteStudent(student.id);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!isPending) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-2">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-destructive">Remove Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <span className="font-semibold text-foreground">"{student?.name}"</span> from this classroom?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-destructive">Warning: This action cannot be undone.</p>
          <p className="mt-1">
            Removing this student will also delete their associated test result history in this section.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Remove Student</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
