import type { LocalizedText } from "@/lib/localize";

// Keep in sync with TAX_TYPE_VALUES in
// smart-tax-bd-server/src/app/module/taxTypes/tax.types.interface.ts
export const TAX_TYPE_VALUES = [
  "income_tax",
  "income_tax_government",
  "income_tax_non_government",
  "house_rental_tax",
  "property_tax",
  "business_tax",
  "import_duty",
  "vat",
  "excise_duty",
  "customs_duty",
  "capital_gains_tax",
  "gift_tax",
  "inheritance_tax",
  "sales_tax",
  "service_tax",
  "entertainment_tax",
  "environmental_tax",
  "wealth_tax",
  "housewife_tax_return",
  "agriculture_tax_return",
  "non_resident_bangladeshis",
] as const;

export type TaxTypeValue = (typeof TAX_TYPE_VALUES)[number];

export type TaxType = {
  _id: string;
  title: LocalizedText | string;
  rate: number;
  value: TaxTypeValue;
  icon?: string;
  tax_orders_id?: string[];
  description: LocalizedText | string;
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
