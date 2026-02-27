"use client";

import { useGetAllTaxOrdersQuery } from "@/redux/api/order/orderApi";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileSearch, ListChecks, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const getStatusBadgeClass = (status: string) => {
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

export default function OrdersPage() {
  const { data, isLoading } = useGetAllTaxOrdersQuery();
  const orders = data?.data || [];

  const paidCount = orders.filter((order: any) => order.isPaid).length;
  const pendingCount = orders.filter((order: any) => order.status?.toLowerCase() === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Tax Orders</h2>
          <p className="text-sm text-muted-foreground">
            Monitor service requests, payment states, and completion progress for all client filings.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">{orders.length}</span>
              <ListChecks className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Paid Orders</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">{paidCount}</span>
              <Wallet className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">{pendingCount}</span>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">All Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead className="hidden md:table-cell">Tax Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-28 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileSearch className="h-5 w-5" />
                          No orders found.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order: any) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-xs text-nowrap text-muted-foreground">
                          {order._id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">{order.mobile}</TableCell>
                        <TableCell className="hidden md:table-cell">{order.tax_year}</TableCell>
                        <TableCell>৳{order.payable_amount}</TableCell>
                        <TableCell>
                          <Badge variant={order.isPaid ? "default" : "outline"}>
                            {order.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(order.status || "pending")}`}
                          >
                            {order.status || "pending"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info("Order detail view coming soon")}
                            className="hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
