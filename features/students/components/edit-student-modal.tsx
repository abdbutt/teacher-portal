"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Phone, Hash } from "lucide-react";
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
import { studentSchema, StudentFormValues } from "../schemas";
import { useUpdateStudent } from "../hooks/use-update-student";
import { StudentRow } from "../types";

interface EditStudentModalProps {
  student: StudentRow | null;
  classroomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentModal({
  student,
  classroomId,
  open,
  onOpenChange,
}: EditStudentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      rollNumber: "",
      name: "",
      parentWhatsappNumber: "",
    },
  });

  useEffect(() => {
    if (student) {
      setValue("rollNumber", student.rollNumber || "");
      setValue("name", student.name);
      setValue("parentWhatsappNumber", student.parentWhatsappNumber);
    }
  }, [student, setValue]);

  const { mutate: handleUpdateStudent, isPending } = useUpdateStudent(
    classroomId,
    () => {
      reset();
      onOpenChange(false);
    }
  );

  const onSubmit = (data: StudentFormValues) => {
    if (student) {
      handleUpdateStudent({
        id: student.id,
        input: data,
      });
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
          <DialogTitle>Edit Student Details</DialogTitle>
          <DialogDescription>
            Update roll number, student name, or parent WhatsApp contact.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Roll Number & Student Name row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="edit-roll-number">Roll No.</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
                  <Hash className="size-3.5" />
                </div>
                <Input
                  id="edit-roll-number"
                  placeholder="101"
                  disabled={isPending}
                  {...register("rollNumber")}
                  className={`pl-8 ${
                    errors.rollNumber ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              </div>
              {errors.rollNumber && (
                <p className="text-[10px] text-destructive font-medium">
                  {errors.rollNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-student-name">Student Full Name</Label>
              <Input
                id="edit-student-name"
                placeholder="e.g. Ayesha Khan"
                disabled={isPending}
                {...register("name")}
                className={
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Parent WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="edit-parent-whatsapp">
              Parent WhatsApp Number (E.164 format)
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Phone className="size-4" />
              </div>
              <Input
                id="edit-parent-whatsapp"
                placeholder="+923001234567"
                disabled={isPending}
                {...register("parentWhatsappNumber")}
                className={`pl-9 ${
                  errors.parentWhatsappNumber
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
            </div>
            {errors.parentWhatsappNumber ? (
              <p className="text-xs text-destructive font-medium">
                {errors.parentWhatsappNumber.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Must include country code starting with '+' (e.g. +92 or +1)
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
