"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/**
 * Owns loading / error / empty for every chart on the dashboard. Centralised so
 * the five charts don't each re-implement it — and so error states exist at all,
 * which is otherwise rare in this codebase.
 */
export function ChartCard({
  title,
  description,
  icon: Icon,
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No data for this period.",
  action,
  className,
  children,
}: ChartCardProps) {
  return (
    // `min-w-0`: as a grid item this card defaults to min-width:auto, which lets
    // the Recharts container force the track wider than the viewport.
    <Card className={cn("border-border/80 shadow-sm min-w-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[260px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading chart...
          </div>
        ) : isError ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-5 w-5" />
            Could not load this chart.
          </div>
        ) : isEmpty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
