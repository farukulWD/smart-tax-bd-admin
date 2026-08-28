"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  ITimePoint,
  TDashboardRange,
} from "@/redux/api/dashboard/dashboardApi";
import { formatBucketLabel, formatCount } from "./dashboard-utils";

type TrendAreaChartProps = {
  data: ITimePoint[];
  range: TDashboardRange;
  /** Names the series in the tooltip. The card title carries it visually, so
   *  a single-series chart needs no legend. */
  label: string;
  colorVar?: string;
};

/**
 * Single-series trend. Used for both orders and user signups — one component
 * rather than two near-identical files.
 */
export function TrendAreaChart({
  data,
  range,
  label,
  colorVar = "var(--chart-1)",
}: TrendAreaChartProps) {
  const config = {
    count: { label, color: colorVar },
  } satisfies ChartConfig;

  const gradientId = `trend-fill-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <ChartContainer config={config} className="h-[260px] w-full min-w-0">
      <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorVar} stopOpacity={0.28} />
            <stop offset="100%" stopColor={colorVar} stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          width={36}
          allowDecimals={false}
          tickFormatter={formatCount}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "4 4" }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) =>
                formatBucketLabel(String(payload?.[0]?.payload?.date ?? ""), range)
              }
            />
          }
        />
        <Area
          dataKey="count"
          type="monotone"
          stroke={colorVar}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
