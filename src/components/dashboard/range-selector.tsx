"use client";

import type { TDashboardRange } from "@/redux/api/dashboard/dashboardApi";
import { cn } from "@/lib/utils";

const OPTIONS: { value: TDashboardRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

type RangeSelectorProps = {
  value: TDashboardRange;
  onChange: (range: TDashboardRange) => void;
};

/** Lifted to the page: one range drives every range-aware chart at once. */
export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Date range"
      className="inline-flex rounded-lg border border-border bg-background p-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
