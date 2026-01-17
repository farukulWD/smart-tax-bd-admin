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
import { Eye, FileSearch } from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const { data, isLoading } = useGetAllTaxOrdersQuery();
  const orders = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tax Orders</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Monitor and process all tax service requests.
          </p>
        </div>

        <div className="rounded-md border bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs text-nowrap">
                      {order._id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{order.mobile}</TableCell>
                    <TableCell>{order.tax_year}</TableCell>
                    <TableCell>৳{order.payable_amount}</TableCell>
                    <TableCell>
                      <Badge variant={order.isPaid ? 'default' : 'outline'}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => toast.info("Order detail view coming soon")}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
