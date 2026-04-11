"use client";

import { useMemo } from "react";
import { IPayment, useGetAllPaymentsQuery } from "@/redux/api/order/orderApi";
import { DataTable, Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";

const paymentForLabels: Record<IPayment["paymentFor"], string> = {
  fee_amount: "Fee Amount",
  fee_due_amount: "Fee Due",
  tax_payable_amount: "Tax Payable",
  remaining_all_amount: "Remaining All",
};

function getStatusBadgeClass(status: IPayment["status"]) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-200";
    case "cancelled":
      return "bg-gray-500/10 text-gray-600 border-gray-200";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-200";
  }
}

export default function PaymentsPage() {
  const { data, isLoading } = useGetAllPaymentsQuery();
  const payments = useMemo<IPayment[]>(() => data?.data || [], [data]);

  const { completedCount, pendingCount, totalAmount } = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        if (payment.status === "completed") {
          acc.completedCount++;
          acc.totalAmount += payment.amount;
        }
        if (payment.status === "pending") acc.pendingCount++;
        return acc;
      },
      { completedCount: 0, pendingCount: 0, totalAmount: 0 },
    );
  }, [payments]);

  const columns: Column<IPayment>[] = useMemo(
    () => [
      {
        header: "Transaction ID",
        cell: (payment) => (
          <span className="font-mono text-xs text-muted-foreground">
            {payment.transaction_id || payment._id?.slice(-10) || "—"}
          </span>
        ),
      },
      {
        header: "Client Name",
        cell: (payment) => (
          <span className="font-medium">
            {payment.order?.personal_information?.name || "—"}
          </span>
        ),
      },
      {
        header: "Payment For",
        cell: (payment) => (
          <Badge variant="secondary" className="font-medium text-xs">
            {paymentForLabels[payment.paymentFor] || payment.paymentFor}
          </Badge>
        ),
      },
      {
        header: "Amount",
        cell: (payment) => (
          <span className="font-black text-primary">
            ৳{payment.amount.toLocaleString()}
          </span>
        ),
      },
      {
        header: "Method",
        className: "hidden md:table-cell",
        cell: (payment) => (
          <span className="capitalize text-sm">
            {payment.payment_method || "—"}
          </span>
        ),
      },
      {
        header: "Date",
        className: "hidden lg:table-cell",
        cell: (payment) => (
          <span className="text-sm text-muted-foreground">
            {payment.createdAt
              ? new Date(payment.createdAt).toLocaleDateString()
              : "—"}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (payment) => (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(payment.status)}`}
          >
            {payment.status}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-sm text-muted-foreground">
          Track all payment transactions across tax orders.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <OrderSummaryCard
          title="Total Payments"
          value={payments.length}
          icon={CreditCard}
        />
        <OrderSummaryCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
        />
        <OrderSummaryCard title="Pending" value={pendingCount} icon={Clock} />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">
            All Transactions
            {!isLoading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({payments.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={payments}
            columns={columns}
            isLoading={isLoading}
            loadingMessage="Loading payments..."
            emptyMessage="No payments found."
            emptyIcon={<XCircle className="h-8 w-8 text-muted-foreground/40" />}
            rowKey={(payment) => payment._id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
