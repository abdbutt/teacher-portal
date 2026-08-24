"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, School } from "lucide-react";
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
import { useCreateClassroom } from "../hooks/use-create-classroom";

interface CreateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClassroomModal({
  open,
  onOpenChange,
}: CreateClassroomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassroomFormValues>({
    resolver: zodResolver(createClassroomSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: handleCreateClassroom, isPending } = useCreateClassroom(() => {
    reset();
    onOpenChange(false);
  });

  const onSubmit = (data: CreateClassroomFormValues) => {
    handleCreateClassroom(data);
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
            <School className="size-5" />
          </div>
          <DialogTitle>Add New Classroom</DialogTitle>
          <DialogDescription>
            Create a new classroom section to manage students and test marks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="classroom-name">Classroom Name</Label>
            <Input
              id="classroom-name"
              placeholder="e.g. Grade 10 - Section B"
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Create Classroom</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
