"use client";

import { useMemo, useState } from "react";
import {
  IOrder,
  useGetAllTaxOrdersQuery,
  useGetSingleTaxOrderQuery,
  useUpdateTaxOrderMutation,
} from "@/redux/api/order/orderApi";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Eye, FileSearch, ListChecks, Loader2, Save, Wallet } from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

const ORDER_STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "completed", "cancelled"];
const isOrderStatus = (value: string): value is OrderStatus => ORDER_STATUS_OPTIONS.includes(value as OrderStatus);

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

const getErrorMessage = (error: unknown) => {
  const fallback = "Request failed. Please try again.";
  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as { data?: { message?: string }; message?: string };
  return maybeError.data?.message || maybeError.message || fallback;
};

const getTaxTypeLabel = (type: unknown) => {
  if (!type) return "Unknown";
  if (typeof type === "string") return type;
  if (typeof type === "object" && type !== null) {
    const typed = type as { title?: string; value?: string; _id?: string };
    return typed.title || typed.value || typed._id || "Unknown";
  }

  return "Unknown";
};

export default function OrdersPage() {
  const { data, isLoading } = useGetAllTaxOrdersQuery();
  const [updateTaxOrder, { isLoading: isUpdatingOrder }] = useUpdateTaxOrderMutation();

  const orders = useMemo<IOrder[]>(() => data?.data || [], [data]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [draftOrderUpdates, setDraftOrderUpdates] = useState<{
    status?: OrderStatus;
    isPaid?: boolean;
    payable_amount?: string;
  }>({});

  const { data: fetchedOrderData, isFetching } = useGetSingleTaxOrderQuery(selectedOrderId as string, {
    skip: !selectedOrderId || !isDetailsOpen,
  });

  const fallbackOrder = orders.find((order) => order._id === selectedOrderId);
  const selectedOrder = fetchedOrderData?.data || fallbackOrder;
  const selectedStatusValue = (draftOrderUpdates.status || selectedOrder?.status || "pending").toLowerCase();
  const selectedStatus = isOrderStatus(selectedStatusValue) ? selectedStatusValue : "pending";
  const selectedPaid = draftOrderUpdates.isPaid ?? Boolean(selectedOrder?.isPaid);
  const selectedAmount = draftOrderUpdates.payable_amount ?? String(selectedOrder?.payable_amount ?? 0);

  const paidCount = orders.filter((order) => order.isPaid).length;
  const pendingCount = orders.filter((order) => order.status?.toLowerCase() === "pending").length;

  const openOrderDetails = (order: IOrder) => {
    setSelectedOrderId(order._id || null);
    const normalizedStatus = (order.status || "pending").toLowerCase();
    setDraftOrderUpdates({
      status: isOrderStatus(normalizedStatus) ? normalizedStatus : "pending",
      isPaid: Boolean(order.isPaid),
      payable_amount: String(order.payable_amount ?? 0),
    });
    setIsDetailsOpen(true);
  };

  const handleQuickUpdate = async (order: IOrder, payload: Partial<Pick<IOrder, "status" | "isPaid">>) => {
    if (!order._id) return;
    try {
      await updateTaxOrder({
        id: order._id,
        data: payload,
      }).unwrap();

      toast.success("Order updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedOrderId) return;

    const parsedAmount = Number(selectedAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Payable amount must be a valid positive number");
      return;
    }

    try {
      await updateTaxOrder({
        id: selectedOrderId,
        data: {
          status: selectedStatus,
          isPaid: selectedPaid,
          payable_amount: parsedAmount,
        },
      }).unwrap();

      toast.success("Order details updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

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
            <div className="max-h-[60vh] overflow-auto">
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
                    orders.map((order) => (
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openOrderDetails(order)}
                              disabled={!order._id}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={order.status?.toLowerCase() === "completed"}
                              onClick={() => handleQuickUpdate(order, { status: "completed" })}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickUpdate(order, { isPaid: !order.isPaid })}
                            >
                              {order.isPaid ? "Mark Unpaid" : "Mark Paid"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Review full order info and update status, payment, and amount.</DialogDescription>
            </DialogHeader>

            {isFetching ? (
              <div className="flex h-36 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading order details...
              </div>
            ) : !selectedOrder ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Order details not found.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono text-xs">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs">{selectedOrder.userId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="text-sm font-medium">{selectedOrder.mobile || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tax/VAT Number</p>
                    <p className="text-sm">{selectedOrder.tax_or_vat_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tax Year</p>
                    <p className="text-sm">{selectedOrder.tax_year || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxable Income</p>
                    <p className="text-sm">{selectedOrder.is_taxable_income ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>Tax Types</Label>
                  <div className="flex flex-wrap gap-2 rounded-md border p-3">
                    {selectedOrder.tax_types?.length ? (
                      selectedOrder.tax_types.map((type: unknown, index: number) => (
                        <Badge key={`${getTaxTypeLabel(type)}-${index}`} variant="outline">
                          {getTaxTypeLabel(type)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No tax types assigned</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) =>
                        setDraftOrderUpdates((previous) => ({ ...previous, status: value as OrderStatus }))
                      }
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status[0].toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="payable_amount">Payable Amount</Label>
                    <Input
                      id="payable_amount"
                      type="number"
                      min={0}
                      value={selectedAmount}
                      onChange={(event) =>
                        setDraftOrderUpdates((previous) => ({
                          ...previous,
                          payable_amount: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="isPaid">Payment Completed</Label>
                  <Switch
                    id="isPaid"
                    checked={selectedPaid}
                    onCheckedChange={(value) =>
                      setDraftOrderUpdates((previous) => ({
                        ...previous,
                        isPaid: value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSaveDetails} disabled={!selectedOrder || isUpdatingOrder}>
                {isUpdatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
