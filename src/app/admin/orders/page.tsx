"use client";

import { useMemo } from "react";
import { IOrder, useGetAllTaxOrdersQuery } from "@/redux/api/order/orderApi";

import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Eye, ListChecks, Wallet } from "lucide-react";
import { getStatusBadgeClass } from "@/components/orders/helper";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import Link from "next/link";

export default function OrdersPage() {
  const { data, isLoading } = useGetAllTaxOrdersQuery();

  const orders = useMemo<IOrder[]>(() => data?.data || [], [data]);

  const { paidCount, pendingCount } = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        if (order.tax_paid_amount > 0) acc.paidCount++;
        if (order.status?.toLowerCase() === "pending") acc.pendingCount++;
        return acc;
      },
      { paidCount: 0, pendingCount: 0 },
    );
  }, [orders]);

  const columns: Column<IOrder>[] = useMemo(
    () => [
      {
        header: "Client Name",
        cell: (order) => (
          <span className="font-medium">{order.personal_iformation?.name}</span>
        ),
      },
      {
        header: "Mobile",
        cell: (order) => (
          <span className="font-medium">
            {order.personal_iformation?.phone}
          </span>
        ),
      },
      {
        header: "Tax Year",
        className: "hidden md:table-cell",
        cell: (order) => order.tax_year,
      },
      {
        header: "Total Due Amount",
        cell: (order) => {
          const { tax_payable_amount, fee_due_amount } = order;
          return `৳${tax_payable_amount + fee_due_amount}`;
        },
      },
      {
        header: "Paid Amount",
        cell: (order) => `৳${order.total_paid_amount || 0}`,
      },
      {
        header: "Status",
        cell: (order) => (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(order.status || "pending")}`}
          >
            {order.status || "pending"}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: (order) => (
          <div className="flex justify-start gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/orders/${order._id}`}>
                <Eye className="mr-1 h-4 w-4" />
                View
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Tax Orders</h2>
        <p className="text-sm text-muted-foreground">
          Monitor service requests, payment states, and completion progress for
          all client filings.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <OrderSummaryCard
          title="Total Orders"
          value={orders?.length || 0}
          icon={ListChecks}
        />
        <OrderSummaryCard title="Paid Orders" value={paidCount} icon={Wallet} />
        <OrderSummaryCard
          title="Pending Review"
          value={pendingCount}
          icon={CheckCircle2}
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">All Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={orders}
            columns={columns}
            isLoading={isLoading}
            loadingMessage="Loading orders..."
            emptyMessage="No orders found."
            rowKey={(order) => order._id || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
