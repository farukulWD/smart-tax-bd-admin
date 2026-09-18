import type { LocalizedText } from "@/lib/localize";
import type { IFileName } from "@/redux/api/file-name/fileNameApi";

// Mirrors the server's tax-type `value` validation. Orders store the value, so
// it is a unique key rather than display copy.
export const TAX_TYPE_VALUE_PATTERN = /^[a-z0-9_]+$/;

export type TaxType = {
  _id: string;
  title: LocalizedText | string;
  rate: number;
  value: string;
  icon?: string;
  // Populated by the server, so an id-only shape is never returned.
  required_files?: IFileName[];
  tax_orders_id?: string[];
  description: LocalizedText | string;
  order?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

// `icon` used to hold a lucide icon name; it now holds an uploaded image URL.
// Legacy rows are still rendered as plain text so they can be spotted and replaced.
export const isIconUrl = (icon?: string) => !!icon && /^https?:\/\//.test(icon);

export const formatTaxTypeLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
