"use client";

import { useState } from "react";
import {
  useGetSingleTaxOrderQuery,
  useUpdateTaxOrderMutation,
} from "@/redux/api/order/orderApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ORDER_STATUS_OPTIONS, OrderStatus } from "./helper";
import { globalErrorHandler } from "@/helpers/globalErrorHandler";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

const isOrderStatus = (value: string): value is OrderStatus =>
  ORDER_STATUS_OPTIONS.includes(value as OrderStatus);

export const OrderDetailsDialog = ({
  open,
  onOpenChange,
  orderId,
}: OrderDetailsDialogProps) => {
  const { data: fetchedOrderData, isFetching } = useGetSingleTaxOrderQuery(
    orderId as string,
    {
      skip: !orderId || !open,
    },
  );

  const [updateTaxOrder, { isLoading: isUpdatingOrder }] =
    useUpdateTaxOrderMutation();

  const [draftUpdates, setDraftUpdates] = useState<{
    status?: OrderStatus;
    isPaid?: boolean;
    tax_payable_amount?: string;
  }>({});

  const order = fetchedOrderData?.data;

  const [prevOrderId, setPrevOrderId] = useState<string | null>(null);

  // Synchronize draft state when a new order is loaded
  if (order && open && order._id !== prevOrderId) {
    const normalizedStatus = (order.status || "pending").toLowerCase();
    setDraftUpdates({
      status: isOrderStatus(normalizedStatus) ? normalizedStatus : "pending",
      isPaid: order.tax_paid_amount > 0,
      tax_payable_amount: String(order.tax_payable_amount ?? 0),
    });
    setPrevOrderId(order._id ?? null);
  }

  const selectedStatusValue = (
    draftUpdates.status ||
    order?.status ||
    "pending"
  ).toLowerCase();

  const selectedStatus = isOrderStatus(selectedStatusValue)
    ? selectedStatusValue
    : "pending";

  const selectedPaid = draftUpdates.isPaid ?? (order?.tax_paid_amount ?? 0) > 0;
  const selectedAmount =
    draftUpdates.tax_payable_amount ?? String(order?.tax_payable_amount ?? 0);

  const handleSaveDetails = async () => {
    if (!orderId) return;

    const parsedAmount = Number(selectedAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Payable amount must be a valid positive number");
      return;
    }

    try {
      await updateTaxOrder({
        id: orderId,
        data: {
          status: selectedStatus,
          tax_payable_amount: parsedAmount,
          tax_paid_amount: selectedPaid ? order?.tax_paid_amount || 1 : 0,
        },
      }).unwrap();

      toast.success("Order details updated");
      onOpenChange(false);
    } catch (error) {
      globalErrorHandler(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Review full order info and update status, payment, and amount.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex h-36 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading order details...
          </div>
        ) : !order ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Order details not found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono text-xs">{order._id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{order.userId || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mobile</p>
                <p className="text-sm font-medium">
                  {order.personal_information?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tax Year</p>
                <p className="text-sm">{order.tax_year || "N/A"}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Source of Income</Label>
              <div className="flex flex-wrap gap-2 rounded-md border p-3">
                {order.source_of_income?.length ? (
                  order.source_of_income.map((type: string, index: number) => (
                    <Badge key={`${type}-${index}`} variant="outline">
                      {type}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No income sources assigned
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setDraftUpdates((previous) => ({
                      ...previous,
                      status: value as OrderStatus,
                    }))
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
                  id="tax_payable_amount"
                  type="number"
                  min={0}
                  value={selectedAmount}
                  onChange={(event) =>
                    setDraftUpdates((previous) => ({
                      ...previous,
                      tax_payable_amount: event.target.value,
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
                  setDraftUpdates((previous) => ({
                    ...previous,
                    isPaid: value,
                  }))
                }
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleSaveDetails}
            disabled={!order || isUpdatingOrder}
          >
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
  );
};
