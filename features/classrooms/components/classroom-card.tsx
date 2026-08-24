"use client";

import Link from "next/link";
import { School, Users, FileSpreadsheet, ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassroomWithCount } from "../types";

interface ClassroomCardProps {
  classroom: ClassroomWithCount;
  onEdit: (classroom: ClassroomWithCount) => void;
  onDelete: (classroom: ClassroomWithCount) => void;
}

export function ClassroomCard({ classroom, onEdit, onDelete }: ClassroomCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 pr-4">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
            {classroom.name}
          </CardTitle>
          <CardDescription className="text-xs">
            Created on {new Date(classroom.createdAt).toLocaleDateString()}
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Actions Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(classroom)}>
                <Pencil className="size-4 text-muted-foreground" />
                <span>Edit Name</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(classroom)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <School className="size-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" />
            <span>{classroom._count.students} Students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="size-4 text-muted-foreground" />
            <span>{classroom._count.testEntries} Tests</span>
          </div>
        </div>

        <Button
          asChild
          variant="secondary"
          size="sm"
          className="w-full justify-between gap-1 group-hover:bg-primary group-hover:text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Link href={`/dashboard/classrooms/${classroom.id}`}>
            <span>Manage Classroom</span>
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
