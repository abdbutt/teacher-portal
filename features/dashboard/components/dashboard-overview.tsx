"use client";

import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { GraduationCap, LogOut, Users, BookOpen, FileCheck2, School } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  user: User;
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
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
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user.name || "Teacher"}! 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your classrooms, student roster, test marks, and automated WhatsApp report cards.
            </p>
          </div>
        </div>

        {/* Quick Overview Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
              <School className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <CardDescription className="mt-1 text-xs">
                Active assigned sections
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <CardDescription className="mt-1 text-xs">
                Enrolled across all classes
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Evaluated</CardTitle>
              <FileCheck2 className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <CardDescription className="mt-1 text-xs">
                Completed test entries
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
