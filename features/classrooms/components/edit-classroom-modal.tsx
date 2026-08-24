"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, School } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  createClassroomSchema,
  CreateClassroomFormValues,
} from "../schemas";
import { useUpdateClassroom } from "../hooks/use-update-classroom";
import { ClassroomWithCount } from "../types";

interface EditClassroomModalProps {
  classroom: ClassroomWithCount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClassroomModal({
  classroom,
  open,
  onOpenChange,
}: EditClassroomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateClassroomFormValues>({
    resolver: zodResolver(createClassroomSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (classroom) {
      setValue("name", classroom.name);
    }
  }, [classroom, setValue]);

  const { mutate: handleUpdateClassroom, isPending } = useUpdateClassroom(() => {
    reset();
    onOpenChange(false);
  });

  const onSubmit = (data: CreateClassroomFormValues) => {
    if (classroom) {
      handleUpdateClassroom({ id: classroom.id, input: data });
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!isPending) {
      reset();
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Pencil className="size-5" />
          </div>
          <DialogTitle>Edit Classroom Name</DialogTitle>
          <DialogDescription>
            Update the title for this classroom section.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-classroom-name">Classroom Name</Label>
            <Input
              id="edit-classroom-name"
              placeholder="e.g. Grade 10 - Section A"
              disabled={isPending}
              {...register("name")}
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium">
                {errors.name.message}
              </p>
            )}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
