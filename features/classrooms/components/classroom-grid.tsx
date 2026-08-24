"use client";

import { useClassrooms } from "../hooks/use-classrooms";
import { ClassroomCard } from "./classroom-card";
import { Skeleton } from "@/components/ui/skeleton";
import { School, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClassroomGridProps {
  onOpenAddModal: () => void;
}

export function ClassroomGrid({ onOpenAddModal }: ClassroomGridProps) {
  const { data: classrooms, isLoading, isError, error } = useClassrooms();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-3">
        <AlertCircle className="size-8 text-destructive mx-auto" />
        <h3 className="text-base font-semibold text-destructive">Failed to load classrooms</h3>
        <p className="text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center space-y-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <School className="size-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">No classrooms yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Create your first classroom section to start adding students, recording test marks, and dispatching WhatsApp report cards.
          </p>
        </div>
        <Button onClick={onOpenAddModal} className="gap-2">
          <Plus className="size-4" />
          <span>Create Classroom</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classrooms.map((classroom) => (
        <ClassroomCard key={classroom.id} classroom={classroom} />
      ))}
    </div>
  );
}
