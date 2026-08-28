// Keep in sync with DISCOUNT_TYPES in
// smart-tax-bd-server/src/app/module/coupons/coupon.interface.ts
export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type Coupon = {
  _id: string;
  /** Stored uppercase by the server; lookups are case-insensitive. */
  code: string;
  description?: string;
  discountType: DiscountType;
  /** Percent (1-100) for "percentage", BDT for "fixed". */
  discountValue: number;
  validFrom?: string;
  /** Absent means the coupon never expires. */
  validUntil?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Derived server-side from the `applied_coupon` snapshots on tax orders,
  // so these are always present on admin list/single reads.
  /** Orders where the service fee has actually been settled. */
  usageCount?: number;
  /** Orders carrying the coupon whose fee is not settled yet. */
  pendingCount?: number;
  /** BDT given up across settled orders. */
  totalDiscount?: number;
};

export const discountTypeLabel: Record<DiscountType, string> = {
  percentage: "Percentage",
  fixed: "Fixed amount",
};

/** Compact table-cell rendering of the discount, e.g. "20%" or "৳500". */
export const formatDiscount = (coupon: Pick<Coupon, "discountType" | "discountValue">) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}%`
    : `৳${Number(coupon.discountValue).toLocaleString("en-BD")}`;

/** Human validity window; both bounds are optional on the server. */
export const formatValidity = (coupon: Pick<Coupon, "validFrom" | "validUntil">) => {
  const from = coupon.validFrom
    ? new Date(coupon.validFrom).toLocaleDateString()
    : null;
  const until = coupon.validUntil
    ? new Date(coupon.validUntil).toLocaleDateString()
    : null;

  if (!from && !until) return "Always";
  if (from && !until) return `From ${from}`;
  if (!from && until) return `Until ${until}`;
  return `${from} — ${until}`;
};

/** True when the window has closed, even if the row is still marked active. */
export const isExpired = (coupon: Pick<Coupon, "validUntil">) =>
  !!coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now();

/** BDT formatted the way the rest of the admin renders money. */
export const formatTaka = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

/**
 * The service fee a customer actually owes, after any applied coupon.
 *
 * Mirrors `getPayableFeeAmount` in
 * smart-tax-bd-server/src/app/module/Tax/tax.utils.ts. Every surface that
 * renders or reasons about the fee must go through this — reading `fee_amount`
 * directly shows the undiscounted list price.
 */
export const getPayableFeeAmount = (order: {
  fee_amount?: number;
  applied_coupon?: { discount_amount?: number };
}) =>
  Math.max(
    0,
    Number(order?.fee_amount || 0) -
      Number(order?.applied_coupon?.discount_amount || 0),
  );

/** The coupon snapshot, or undefined when the nested path is present but empty. */
export const getAppliedCoupon = <T extends { code?: string }>(
  appliedCoupon?: T,
): T | undefined => (appliedCoupon?.code ? appliedCoupon : undefined);
