"use client";

import { FileSpreadsheet, Calendar, Award, Users, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestEntryItem } from "../types";

interface TestListProps {
  tests: TestEntryItem[];
  totalStudentsCount: number;
  onCreateTest: () => void;
  onEnterMarks: (test: TestEntryItem) => void;
}

export function TestList({
  tests,
  totalStudentsCount,
  onCreateTest,
  onEnterMarks,
}: TestListProps) {
  if (tests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center space-y-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <FileSpreadsheet className="size-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">No test entries created yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Create your first test or exam entry to start recording marks and dispatching WhatsApp report cards.
          </p>
        </div>
        <Button onClick={onCreateTest} className="gap-2">
          <Plus className="size-4" />
          <span>Create First Test</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tests.map((test) => {
        const recordedCount = test._count?.results || 0;
        const isComplete = recordedCount > 0 && recordedCount >= totalStudentsCount;

        return (
          <Card
            key={test.id}
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50"
          >
            <CardContent className="p-5 space-y-4">
              {/* Test Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground mb-1">
                    <Calendar className="size-3 mr-1" />
                    {new Date(test.date).toLocaleDateString()}
                  </Badge>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {test.subject}
                  </h3>
                </div>

                <div className="flex flex-col items-end">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                    <Award className="size-3.5" />
                    <span>{test.totalMarks} Marks</span>
                  </div>
                </div>
              </div>

              {/* Recorded Results Progress */}
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  <span>
                    {recordedCount} / {totalStudentsCount} Recorded
                  </span>
                </div>
                {isComplete ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Complete
                  </Badge>
                ) : recordedCount > 0 ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    In Progress
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Pending Marks
                  </Badge>
                )}
              </div>

              {/* Action Button */}
              <Button
                onClick={() => onEnterMarks(test)}
                variant="secondary"
                size="sm"
                className="w-full justify-between gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <span>{recordedCount > 0 ? "Edit / View Marks" : "Enter Marks"}</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
