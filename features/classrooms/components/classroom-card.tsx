"use client";

import { School, Users, FileSpreadsheet, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PortalCard } from "@/components/ui/portal-card";
import { ClassroomWithCount } from "../types";

interface ClassroomCardProps {
  classroom: ClassroomWithCount;
  onEdit: (classroom: ClassroomWithCount) => void;
  onDelete: (classroom: ClassroomWithCount) => void;
}

export function ClassroomCard({ classroom, onEdit, onDelete }: ClassroomCardProps) {
  const actionsMenu = (
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
  );

  return (
    <PortalCard
      title={classroom.name}
      subtitle={`Created on ${new Date(classroom.createdAt).toLocaleDateString()}`}
      icon={<School className="size-5" />}
      actionsMenu={actionsMenu}
      stats={[
        {
          icon: <Users className="size-4 text-muted-foreground" />,
          label: `${classroom._count.students} Students`,
        },
        {
          icon: <FileSpreadsheet className="size-4 text-muted-foreground" />,
          label: `${classroom._count.testEntries} Tests`,
        },
      ]}
      actionText="Manage Classroom"
      actionHref={`/dashboard/classrooms/${classroom.id}`}
    />
  );
}
