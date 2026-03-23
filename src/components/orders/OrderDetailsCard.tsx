"use client";

import { useState } from "react";
import { useUpdateTaxOrderMutation } from "@/redux/api/order/orderApi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Loader2,
  Save,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  History,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { ORDER_STATUS_OPTIONS, OrderStatus } from "./helper";
import { globalErrorHandler } from "@/helpers/globalErrorHandler";
import { IOrder } from "@/redux/api/order/orderApi";

interface OrderDetailsCardProps {
  order: IOrder;
}

const isOrderStatus = (value: string): value is OrderStatus =>
  ORDER_STATUS_OPTIONS.includes(value as OrderStatus);

export const OrderDetailsCard = ({ order }: OrderDetailsCardProps) => {
  const [updateTaxOrder, { isLoading: isUpdatingOrder }] =
    useUpdateTaxOrderMutation();

  const [draftUpdates, setDraftUpdates] = useState<{
    status: OrderStatus;
    isPaid: boolean;
    tax_payable_amount: string;
  }>(() => {
    const normalizedStatus = (order.status || "pending").toLowerCase();
    return {
      status: isOrderStatus(normalizedStatus) ? normalizedStatus : "pending",
      isPaid: (order.tax_paid_amount ?? 0) > 0,
      tax_payable_amount: String(order.tax_payable_amount ?? 0),
    };
  });

  const selectedStatus = draftUpdates.status;
  const selectedPaid = draftUpdates.isPaid;
  const selectedAmount = draftUpdates.tax_payable_amount;

  const handleSaveDetails = async () => {
    if (!order._id) return;

    const parsedAmount = Number(selectedAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Payable amount must be a valid positive number");
      return;
    }

    try {
      await updateTaxOrder({
        id: order._id,
        data: {
          status: selectedStatus,
          tax_payable_amount: parsedAmount,
          tax_paid_amount: selectedPaid ? order?.tax_paid_amount || 1 : 0,
        },
      }).unwrap();

      toast.success("Order details updated successfully");
    } catch (error) {
      globalErrorHandler(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 font-bold">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none px-3 py-1 font-bold"
          >
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 font-bold">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="px-3 py-1 font-bold">
            {status}
          </Badge>
        );
    }
  };

  console.log(order);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-none shadow-xl ring-1 ring-black/5">
        <CardHeader className="bg-linear-to-r from-primary/10 via-background to-primary/5 pb-10 pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="text-3xl font-extrabold tracking-tight">
                  Tax Submission Review
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  Order ID:{" "}
                  <span className="ml-1 font-mono text-foreground">
                    {order._id}
                  </span>
                </div>
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  User ID:{" "}
                  <span className="ml-1 font-mono text-foreground">
                    {order.userId || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-start">
              {getStatusBadge(order.status)}
              <Badge
                variant={order.tax_paid_amount > 0 ? "default" : "outline"}
                className={
                  order.tax_paid_amount > 0
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
              >
                {order.tax_paid_amount > 0
                  ? "PAYMENT SUCCESSFUL"
                  : "PAYMENT PENDING"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-10 p-8 lg:grid-cols-2">
          {/* Left Column: Comprehensive Info */}
          <div className="space-y-10">
            {/* User Profile Section */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center text-xl font-bold text-foreground">
                  <User className="mr-3 h-5 w-5 text-primary" />
                  Applicant Profile
                </h3>
                <Badge
                  variant="outline"
                  className="rounded-full px-4 font-bold"
                >
                  STEP {order.current_step}/3
                </Badge>
              </div>
              <div className="grid gap-6 rounded-2xl bg-muted/20 p-6 shadow-inner ring-1 ring-black/5">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Full Name
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {order.personal_iformation?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Email Address
                    </p>
                    <p className="flex items-center text-base font-bold text-foreground">
                      <Mail className="mr-2 h-4 w-4 text-primary opacity-70" />
                      {order.personal_iformation?.email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Mobile Number
                    </p>
                    <p className="flex items-center text-base font-bold text-foreground">
                      <Phone className="mr-2 h-4 w-4 text-primary opacity-70" />
                      {order.personal_iformation?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Applicant Category
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.personal_iformation?.are_you_student && (
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none">
                          STUDENT
                        </Badge>
                      )}
                      {order.personal_iformation?.are_you_house_wife && (
                        <Badge className="bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-none">
                          HOUSEWIFE
                        </Badge>
                      )}
                      {!order.personal_iformation?.are_you_student &&
                        !order.personal_iformation?.are_you_house_wife && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">
                            STANDARD
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Income & Tax Configuration */}
            <section>
              <h3 className="mb-5 flex items-center text-xl font-bold text-foreground">
                <DollarSign className="mr-3 h-5 w-5 text-primary" />
                Financial Records
              </h3>
              <div className="grid gap-6 rounded-2xl bg-muted/20 p-6 shadow-inner ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-muted pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Assessment Tax Year
                    </p>
                    <p className="flex items-center text-lg font-black text-primary">
                      <Calendar className="mr-2 h-5 w-5" />
                      {order.tax_year || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                    Declared Income Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.source_of_income?.length ? (
                      order.source_of_income.map((type, index) => (
                        <Badge
                          key={`${type}-${index}`}
                          variant="secondary"
                          className="px-3 py-1 font-semibold text-[11px] bg-background"
                        >
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm italic text-muted-foreground font-medium">
                        No income sources declared
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Fee Amount
                    </p>
                    <p className="text-xl font-black text-foreground">
                      ৳{order.fee_amount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Fee Due
                    </p>
                    <p className="text-xl font-black text-red-500">
                      ৳{order.fee_due_amount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Tax Payable
                    </p>
                    <p className="text-xl font-black text-primary">
                      ৳{order.tax_payable_amount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Tax Paid
                    </p>
                    <p className="text-xl font-black text-emerald-600">
                      ৳{order.tax_paid_amount ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Decisions & Details */}
          <div className="space-y-10">
            {/* Administration Tools */}
            <section>
              <h3 className="mb-5 flex items-center text-xl font-bold text-foreground">
                <Activity className="mr-3 h-5 w-5 text-primary" />
                Administrative Actions
              </h3>
              <div className="grid gap-8 overflow-hidden rounded-2xl border-4 border-primary/5 bg-background p-8 shadow-lg ring-1 ring-primary/10">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                    >
                      Modify Process Status
                    </Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) =>
                        setDraftUpdates((previous) => ({
                          ...previous,
                          status: value as OrderStatus,
                        }))
                      }
                    >
                      <SelectTrigger
                        id="status"
                        className="h-14 w-full bg-muted/10 border-muted text-base font-bold"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="font-medium"
                          >
                            {status[0].toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="tax_payable_amount"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                    >
                      Adjust Tax Payable (৳)
                    </Label>
                    <Input
                      id="tax_payable_amount"
                      type="number"
                      min={0}
                      className="h-14 bg-muted/10 border-muted text-lg font-black"
                      value={selectedAmount}
                      onChange={(event) =>
                        setDraftUpdates((previous) => ({
                          ...previous,
                          tax_payable_amount: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-muted p-5 transition-all hover:bg-primary/5 hover:border-primary/20">
                    <div className="space-y-1">
                      <Label
                        htmlFor="isPaid"
                        className="cursor-pointer text-base font-bold"
                      >
                        Payment Fulfillment
                      </Label>
                      <p className="text-xs font-medium text-muted-foreground">
                        Manually verify and mark this order as paid
                      </p>
                    </div>
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

                <Button
                  className="h-14 w-full text-lg font-black tracking-wide shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleSaveDetails}
                  disabled={isUpdatingOrder}
                >
                  {isUpdatingOrder ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      SYSTEM UPDATING...
                    </>
                  ) : (
                    <>
                      <Save className="mr-3 h-6 w-6" />
                      SAVE ALL CHANGES
                    </>
                  )}
                </Button>
              </div>
            </section>

            {/* Additional Attributes Block */}
            <section>
              <h3 className="mb-5 flex items-center text-xl font-bold text-foreground">
                <History className="mr-3 h-5 w-5 text-primary" />
                Internal System Data
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/20 p-6 shadow-inner ring-1 ring-black/5">
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    Self Submission
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    {order.is_self ? (
                      <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                    )}
                    {order.is_self ? "YES" : "NO"}
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    Third Party Order
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    {order.for_other_person ? (
                      <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                    )}
                    {order.for_other_person ? "YES" : "NO"}
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    Tax Office Notice
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    {order.are_you_get_notice_from_tax_office ? (
                      <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                    )}
                    {order.are_you_get_notice_from_tax_office ? "YES" : "NO"}
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    LTD Co. Income
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    {order.income_from_ldt_company ? (
                      <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                    )}
                    {order.income_from_ldt_company ? "YES" : "NO"}
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    Partnership Income
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    {order.income_from_partnership_firm ? (
                      <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="mr-1.5 h-4 w-4 text-red-500" />
                    )}
                    {order.income_from_partnership_firm ? "YES" : "NO"}
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    Submission Date
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    <Calendar className="mr-1.5 h-4 w-4 text-primary opacity-70" />
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </CardContent>

        {order.documents && order.documents.length > 0 && (
          <CardFooter className="bg-muted/10 border-t border-muted p-8">
            <div className="w-full">
              <h3 className="mb-6 flex items-center text-xl font-bold text-foreground">
                <FileText className="mr-3 h-5 w-5 text-primary" />
                Submitted Documentation
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {order.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 rounded-2xl border bg-background p-4 text-center transition-all hover:border-primary hover:shadow-xl hover:-translate-y-1 active:scale-95"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white shadow-sm ring-1 ring-primary/10">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                        FILE
                      </span>
                      <span className="block text-xs font-bold truncate w-full max-w-[80px]">
                        #{idx + 1}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};
