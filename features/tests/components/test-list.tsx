"use client";

import { FileSpreadsheet, Users, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalCard } from "@/components/ui/portal-card";
import { TestEntryItem } from "../types";

interface TestListProps {
  tests: TestEntryItem[];
  totalStudentsCount: number;
  onCreateTest: () => void;
  onEnterMarks: (test: TestEntryItem) => void;
  onDispatchReports?: (test: TestEntryItem) => void;
}

export function TestList({
  tests,
  totalStudentsCount,
  onCreateTest,
  onEnterMarks,
  onDispatchReports,
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

        const statusBadge = isComplete ? (
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
        );

        const dispatchAction = recordedCount > 0 && onDispatchReports ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDispatchReports(test)}
            className="h-8 gap-1.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
          >
            <Send className="size-3.5 text-emerald-600" />
            <span>Dispatch</span>
          </Button>
        ) : undefined;

        return (
          <PortalCard
            key={test.id}
            title={test.subject}
            subtitle={`${test.totalMarks} Total Marks • ${new Date(test.date).toLocaleDateString()}`}
            icon={<FileSpreadsheet className="size-5" />}
            actionsMenu={dispatchAction}
            stats={[
              {
                icon: <Users className="size-4 text-muted-foreground" />,
                label: `${recordedCount} / ${totalStudentsCount} Recorded`,
              },
            ]}
            statusBadge={statusBadge}
            actionText={recordedCount > 0 ? "Edit / View Marks" : "Enter Marks"}
            onActionClick={() => onEnterMarks(test)}
          />
        );
      })}
    </div>
  );
}
