import type { IFileName } from "@/redux/api/file-name/fileNameApi";

export type IncomeSource = {
  _id: string;
  /**
   * Stable key stored on every tax order (e.g. "Income from Govt.Job").
   * Renaming it detaches orders that already declared it — use `title` for
   * anything a user reads.
   */
  value: string;
  title: { en: string; bn: string };
  // Populated by the server, so an id-only shape is never returned.
  required_files: IFileName[];
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Trims the prefix every legacy value shares, for compact table cells. */
export const shortIncomeSourceLabel = (value: string) =>
  value.replace(/^Income from /, "");
