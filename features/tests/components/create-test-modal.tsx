"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, FileSpreadsheet, Calendar, BookOpen, Award } from "lucide-react";
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
import { createTestSchema, CreateTestFormValues } from "../schemas";
import { useCreateTest } from "../hooks/use-create-test";

interface CreateTestModalProps {
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTestModal({
  classroomId,
  open,
  onOpenChange,
}: CreateTestModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      subject: "",
      totalMarks: 100,
      date: todayStr,
    },
  });

  const { mutate: handleCreateTest, isPending } = useCreateTest(
    classroomId,
    () => {
      reset({
        subject: "",
        totalMarks: 100,
        date: todayStr,
      });
      onOpenChange(false);
    }
  );

  const onSubmit = (data: CreateTestFormValues) => {
    handleCreateTest({
      ...data,
      classroomId,
    });
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
            <FileSpreadsheet className="size-5" />
          </div>
          <DialogTitle>Create Test Entry</DialogTitle>
          <DialogDescription>
            Record a new test or assignment to log student marks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="test-subject">Subject / Exam Name</Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <BookOpen className="size-4" />
              </div>
              <Input
                id="test-subject"
                placeholder="e.g. Mathematics Mid-Term"
                disabled={isPending}
                {...register("subject")}
                className={`pl-9 ${
                  errors.subject ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            </div>
            {errors.subject && (
              <p className="text-xs text-destructive font-medium">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Total Marks & Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="total-marks">Total Marks</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Award className="size-4" />
                </div>
                <Input
                  id="total-marks"
                  type="number"
                  placeholder="100"
                  disabled={isPending}
                  {...register("totalMarks")}
                  className={`pl-9 ${
                    errors.totalMarks ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              </div>
              {errors.totalMarks && (
                <p className="text-xs text-destructive font-medium">
                  {errors.totalMarks.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-date">Test Date</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Calendar className="size-4" />
                </div>
                <Input
                  id="test-date"
                  type="date"
                  disabled={isPending}
                  {...register("date")}
                  className={`pl-9 ${
                    errors.date ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-destructive font-medium">
                  {errors.date.message}
                </p>
              )}
            </div>
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
                  <span>Create Test</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
