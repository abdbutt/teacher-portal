"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { GraduationCap, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassroomGrid } from "@/features/classrooms/components/classroom-grid";
import { CreateClassroomModal } from "@/features/classrooms/components/create-classroom-modal";

interface DashboardOverviewProps {
  user: User;
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Teacher Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold">{user.name || "Teacher"}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Title Bar with Add Classroom Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Classroom Roster
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of all your active class sections, enrolled students, and test marks.
            </p>
          </div>
          <Button onClick={handleOpenAddModal} className="gap-2 shrink-0">
            <Plus className="size-4" />
            <span>Add Classroom</span>
          </Button>
        </div>

        {/* Classroom Grid View */}
        <ClassroomGrid onOpenAddModal={handleOpenAddModal} />

        {/* Create Classroom Modal */}
        <CreateClassroomModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />
      </main>
    </div>
  );
}
