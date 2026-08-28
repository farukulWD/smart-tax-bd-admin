"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCount } from "./dashboard-utils";

export type CategoryDatum = { label: string; count: number };

type CategoryBarChartProps = {
  data: CategoryDatum[];
  /** Tooltip name for the measure, e.g. "Orders". */
  measureLabel: string;
  minHeight?: number;
};

/**
 * Sorted horizontal bars in ONE hue.
 *
 * Deliberately not a pie/donut: order statuses (13) and income sources (9) both
 * exceed the 8-slot categorical ceiling, and colouring past it means cycling
 * hues that readers — especially with CVD — cannot tell apart. Bar length
 * carries the magnitude, so colour does not have to. Values are direct-labelled,
 * which also satisfies the light-mode contrast relief rule.
 */
export function CategoryBarChart({
  data,
  measureLabel,
  minHeight = 96,
}: CategoryBarChartProps) {
  const config = {
    count: { label: measureLabel, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  const sorted = [...data].sort((a, b) => b.count - a.count);
  // Long labels ("Income from Financial Asset") need room or they truncate.
  const axisWidth = Math.min(
    190,
    Math.max(90, ...sorted.map((d) => d.label.length * 6.6)),
  );
  // Height follows the row count so two categories don't get stretched into
  // slabs, and ten don't get crushed. `maxBarSize` caps thickness on top of
  // this — Recharts otherwise divides the full height between however many
  // bars exist, which makes a single-category chart one giant block.
  const chartHeight = Math.min(
    440,
    Math.max(minHeight, sorted.length * 38 + 36),
  );

  return (
    <ChartContainer
      config={config}
      // Capped width: on a full-width card an unconstrained bar runs ~2000px,
      // which reads as a slab rather than a measured length.
      className="w-full min-w-0 max-w-3xl"
      style={{ height: chartHeight }}
    >
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ left: 4, right: 44, top: 4, bottom: 4 }}
        barCategoryGap={6}
      >
        {/* Explicit domain. Left to its own nice-ticks with
            allowDecimals={false}, Recharts stretches a max of 1 to 0–4 so the
            only bar covers a quarter of the plot; pinned to dataMax instead,
            a lone bar fills the full width and reads as a slab. The floor of 4
            plus 15% headroom keeps small counts short and leaves room for the
            end label. No gridlines — every bar is direct-labelled already. */}
        <XAxis
          type="number"
          hide
          domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.15))]}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={axisWidth}
          tickMargin={6}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
          dataKey="count"
          fill="var(--chart-1)"
          radius={[0, 4, 4, 0]}
          maxBarSize={26}
        >
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-muted-foreground"
            fontSize={11}
            formatter={(value: number) => formatCount(value)}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
