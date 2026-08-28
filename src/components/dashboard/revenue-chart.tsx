"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  IRevenuePoint,
  TDashboardRange,
} from "@/redux/api/dashboard/dashboardApi";
import {
  formatBDT,
  formatBucketLabel,
  formatCompactBDT,
} from "./dashboard-utils";

type RevenueChartProps = {
  data: IRevenuePoint[];
  range: TDashboardRange;
};

/**
 * Cash collected against the balance still owed, per bucket.
 *
 * Both series are BDT and share ONE y-axis — a second axis would let the two
 * scales be drawn to arbitrary relative heights and invite a false comparison.
 * Stacked rather than grouped: together they are the period's total billing.
 */
export function RevenueChart({ data, range }: RevenueChartProps) {
  const config = {
    collected: { label: "Collected", color: "var(--chart-1)" },
    outstanding: { label: "Outstanding", color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-[260px] w-full min-w-0">
      <BarChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => formatBucketLabel(value, range)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={formatCompactBDT}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(_, payload) =>
                formatBucketLabel(String(payload?.[0]?.payload?.date ?? ""), range)
              }
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {config[name as keyof typeof config]?.label ?? name}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatBDT(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {/* 2px surface gap between stacked segments keeps the boundary readable. */}
        <Bar
          dataKey="collected"
          stackId="money"
          fill="var(--chart-1)"
          stroke="var(--card)"
          strokeWidth={2}
        />
        <Bar
          dataKey="outstanding"
          stackId="money"
          fill="var(--chart-2)"
          stroke="var(--card)"
          strokeWidth={2}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
