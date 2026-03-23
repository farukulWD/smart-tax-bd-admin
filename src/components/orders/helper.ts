export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

export const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "border-amber-200 bg-amber-100/70 text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-400";
    case "processing":
      return "border-blue-200 bg-blue-100/70 text-blue-800 dark:border-blue-700/60 dark:bg-blue-900/30 dark:text-blue-400";
    case "completed":
      return "border-emerald-200 bg-emerald-100/70 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "cancelled":
      return "border-red-200 bg-red-100/70 text-red-800 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "border-border bg-muted text-foreground";
  }
};

export const getTaxTypeLabel = (type: unknown) => {
  if (!type) return "Unknown";
  if (typeof type === "string") return type;
  if (typeof type === "object" && type !== null) {
    const typed = type as { title?: string; value?: string; _id?: string };
    return typed.title || typed.value || typed._id || "Unknown";
  }

  return "Unknown";
};
