"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PortalCardStat {
  icon: React.ReactNode;
  label: React.ReactNode;
}

export interface PortalCardProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerBadge?: React.ReactNode;
  actionsMenu?: React.ReactNode;
  stats: PortalCardStat[];
  statusBadge?: React.ReactNode;
  actionText: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function PortalCard({
  title,
  subtitle,
  icon,
  headerBadge,
  actionsMenu,
  stats,
  statusBadge,
  actionText,
  actionHref,
  onActionClick,
}: PortalCardProps) {
  const renderActionButton = () => {
    const buttonContent = (
      <>
        <span>{actionText}</span>
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </>
    );

    const buttonClasses =
      "w-full justify-between gap-1 group-hover:bg-primary group-hover:text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-colors";

    if (actionHref) {
      return (
        <Button asChild variant="secondary" size="sm" className={buttonClasses}>
          <Link href={actionHref}>{buttonContent}</Link>
        </Button>
      );
    }

    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onActionClick}
        className={buttonClasses}
      >
        {buttonContent}
      </Button>
    );
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 pr-4 min-w-0 flex-1">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate">
            {title}
          </CardTitle>
          {subtitle && (
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {actionsMenu}
          {headerBadge}
          {icon && (
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                {stat.icon}
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          {statusBadge && <div>{statusBadge}</div>}
        </div>

        {renderActionButton()}
      </CardContent>
    </Card>
  );
}
