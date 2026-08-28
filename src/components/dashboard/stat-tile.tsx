"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatTileProps = {
  name: string;
  value: string;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
};

export function StatTile({
  name,
  value,
  helper,
  icon: Icon,
  isLoading,
}: StatTileProps) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {name}
        </CardTitle>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold">{value}</p>
            {helper && (
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
