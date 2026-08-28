import type { TDashboardRange } from "@/redux/api/dashboard/dashboardApi";

/**
 * Bucket keys arrive as `YYYY-MM-DD` (7d/30d) or `YYYY-MM` (12m). They are
 * already Dhaka-local calendar keys, so they are formatted as plain strings —
 * passing them through `new Date()` would re-apply the browser's offset and
 * shift labels by a day.
 */
export const formatBucketLabel = (key: string, range: TDashboardRange) => {
  const [year, month, day] = key.split("-");
  const monthIndex = Number(month) - 1;
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthName = monthNames[monthIndex] ?? month;

  if (range === "12m") return `${monthName} ${year.slice(2)}`;
  return `${day} ${monthName}`;
};

/** `payment_pending` reads as a database value; "Payment pending" reads as English. */
export const humanizeStatus = (status: string) =>
  status
    .split("_")
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(" ");

const bdt = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
});

export const formatBDT = (value: number) => `৳${bdt.format(value ?? 0)}`;

/** Axis ticks need to stay short or they collide. */
export const formatCompactBDT = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `৳${Math.round(value / 1_000)}k`;
  return `৳${value}`;
};

export const formatCount = (value: number) => bdt.format(value ?? 0);
