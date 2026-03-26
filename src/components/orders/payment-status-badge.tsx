"use client";

import { IOrder } from "@/redux/api/order/orderApi";
import { Badge } from "../ui/badge";

const PaymentStatusBadge = ({ order }: { order: IOrder }) => {
  const isPaid = order?.total_amount === order?.total_paid_amount;
  switch (isPaid) {
    case isPaid:
      return (
        <Badge
          variant={isPaid ? "default" : "outline"}
          className={isPaid ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {isPaid ? "PAYMENT COMPLETED" : "PAYMENT PENDING"}
        </Badge>
      );
  }
};

export default PaymentStatusBadge;
