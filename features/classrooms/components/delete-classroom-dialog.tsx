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
import { useDeleteClassroom } from "../hooks/use-delete-classroom";
import { ClassroomWithCount } from "../types";

interface DeleteClassroomDialogProps {
  classroom: ClassroomWithCount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteClassroomDialog({
  classroom,
  open,
  onOpenChange,
}: DeleteClassroomDialogProps) {
  const { mutate: handleDeleteClassroom, isPending } = useDeleteClassroom(() => {
    onOpenChange(false);
  });

  const onConfirm = () => {
    if (classroom) {
      handleDeleteClassroom(classroom.id);
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
          <DialogTitle className="text-destructive">Delete Classroom</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">"{classroom?.name}"</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-destructive">Warning: This action cannot be undone.</p>
          <p>
            Deleting this classroom will permanently remove all enrolled students ({classroom?._count.students || 0}) and recorded tests ({classroom?._count.testEntries || 0}).
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
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Delete Classroom</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
