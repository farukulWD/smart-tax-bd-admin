"use client";

import { IOrder } from "@/redux/api/order/orderApi";
import { getPayableFeeAmount } from "@/lib/coupon";
import { Badge } from "../ui/badge";

const PaymentStatusBadge = ({ order }: { order: IOrder }) => {
  // A bucket is "covered" when it is paid or there is nothing to pay for it.
  // Coupon-discounted fee: a coupon covering the fee in full leaves nothing
  // to collect, so the bucket counts as covered.
  const feeCovered =
    order?.is_fee_amount_paid || getPayableFeeAmount(order ?? {}) <= 0;
  const feeDueCovered =
    order?.is_fee_due_amount_paid || (order?.fee_due_amount ?? 0) <= 0;
  const taxCovered =
    order?.is_tax_payable_amount_paid || (order?.tax_payable_amount ?? 0) <= 0;
  const isPaid = feeCovered && feeDueCovered && taxCovered;

  return (
    <Badge
      variant={isPaid ? "default" : "outline"}
      className={isPaid ? "bg-green-500 hover:bg-green-600" : ""}
    >
      {isPaid ? "PAYMENT COMPLETED" : "PAYMENT PENDING"}
    </Badge>
  );
};

export default PaymentStatusBadge;
