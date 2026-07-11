"use client";

import { useRef, useState } from "react";
import {
  useUpdateTaxOrderMutation,
  useAdminUploadDocumentForUserMutation,
  useRecordCashPaymentMutation,
} from "@/redux/api/order/orderApi";
import { useUploadFileMutation } from "@/redux/api/file/fileApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Briefcase,
  History,
  DollarSign,
  Upload,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { ORDER_STATUS_OPTIONS, OrderStatus } from "./helper";
import { globalErrorHandler } from "@/helpers/globalErrorHandler";
import { IOrder } from "@/redux/api/order/orderApi";
import StatusBadge from "./status-badge";
import PaymentStatusBadge from "./payment-status-badge";
import Link from "next/link";

const ADMIN_FILE_TYPES = ["Acknowledgement", "Tax Certificate"] as const;

const COMMON_REQUIRED_DOCUMENTS = [
  "TIN Certificate",
  "NID Copy",
  "Bank Statement",
];
const INCOME_SOURCE_DOCUMENT_MAP: Record<string, string[]> = {
  "Income from Govt.Job": ["Salary Statement", "Tax Deduction Copy"],
  "Income from Private Job": ["Salary Statement", "Tax Deduction Copy"],
  "Income from Business": [
    "Trade License",
    "Purchase Statement",
    "Sales or Received Statement",
    "Profit & Loss Statement",
    "Balance Sheet",
  ],
  "Income from Rent": ["Tax Token"],
  "Income from Agriculture": ["Others Documents"],
  "Income from Financial Asset": [
    "DPS Certificate",
    "FDR Certificate",
    "Sonchoypotro Certificate",
    "Insurance Certificate",
    "Share Certificate",
    "Pension Scheme Certificate",
  ],
  "Income from Capital Gain": [
    "Land Purchase Documents",
    "Flat Purchase Documents",
    "Vehicle Purchase Documents",
  ],
  "Income from others Source": ["Others Documents"],
  "Income from Forign Remitance": ["Bank Statement"],
};

const BUSINESS_DOCUMENTS = [
  "Trade License",
  "Purchase Statement",
  "Sales or Received Statement",
  "Profit & Loss Statement",
  "Balance Sheet",
];

const TAX_TYPE_DOCUMENT_MAP: Record<string, string[]> = {
  income_tax: ["Salary Statement", "Tax Deduction Copy"],
  income_tax_government: ["Salary Statement", "Tax Deduction Copy"],
  income_tax_non_government: ["Salary Statement", "Tax Deduction Copy"],
  business_tax: BUSINESS_DOCUMENTS,
  sales_tax: BUSINESS_DOCUMENTS,
  vat: BUSINESS_DOCUMENTS,
  service_tax: BUSINESS_DOCUMENTS,
  import_duty: BUSINESS_DOCUMENTS,
  excise_duty: BUSINESS_DOCUMENTS,
  customs_duty: BUSINESS_DOCUMENTS,
  entertainment_tax: BUSINESS_DOCUMENTS,
  environmental_tax: BUSINESS_DOCUMENTS,
  house_rental_tax: ["Tax Token"],
  property_tax: ["Tax Token"],
  capital_gains_tax: [
    "Land Purchase Documents",
    "Flat Purchase Documents",
    "Vehicle Purchase Documents",
  ],
  gift_tax: ["Others Documents"],
  inheritance_tax: ["Others Documents"],
  wealth_tax: [
    "DPS Certificate",
    "FDR Certificate",
    "Sonchoypotro Certificate",
    "Insurance Certificate",
    "Share Certificate",
    "Pension Scheme Certificate",
  ],
  housewife_tax_return: ["Others Documents"],
  agriculture_tax_return: ["Others Documents"],
  non_resident_bangladeshis: ["Bank Statement", "Others Documents"],
};

const formatTaxTypeLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function getRequiredDocuments(order: IOrder): string[] {
  const required = new Set<string>(COMMON_REQUIRED_DOCUMENTS);
  (order.source_of_income || []).forEach((source) => {
    (INCOME_SOURCE_DOCUMENT_MAP[source as string] || []).forEach((doc) =>
      required.add(doc),
    );
  });
  (order.tax_types || []).forEach((type) => {
    (TAX_TYPE_DOCUMENT_MAP[type] || []).forEach((doc) => required.add(doc));
  });
  if (order.are_you_get_notice_from_tax_office) {
    required.add("Notice from Income Tax Office");
  }
  if (order.income_from_partnership_firm || order.income_from_ldt_company) {
    required.add("Balance Sheet");
  }
  return Array.from(required);
}

interface OrderDetailsCardProps {
  order: IOrder;
}

const isOrderStatus = (value: string): value is OrderStatus =>
  ORDER_STATUS_OPTIONS.includes(value as OrderStatus);

export const OrderDetailsCard = ({ order }: OrderDetailsCardProps) => {
  const [updateTaxOrder, { isLoading: isUpdatingOrder }] =
    useUpdateTaxOrderMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [adminUploadDocumentForUser] = useAdminUploadDocumentForUserMutation();
  const [recordCashPayment, { isLoading: isRecordingCash }] =
    useRecordCashPaymentMutation();
  const [cashPaymentFor, setCashPaymentFor] = useState<string>("");
  const [pendingDocFiles, setPendingDocFiles] = useState<
    Record<string, File | null>
  >({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    type: "",
    name: "",
    file: null as File | null,
  });

  const [draftUpdates, setDraftUpdates] = useState<{
    status: OrderStatus;
    tax_payable_amount: string;
    fee_due_amount: string;
  }>(() => {
    const normalizedStatus = (order.status || "pending").toLowerCase();
    return {
      status: isOrderStatus(normalizedStatus) ? normalizedStatus : "pending",
      fee_due_amount: String(order.fee_due_amount ?? 0),
      tax_payable_amount: String(order.tax_payable_amount ?? 0),
    };
  });

  const selectedStatus = draftUpdates.status;
  const selectedAmount = draftUpdates.tax_payable_amount;
  const selectedFeeDueAmount = draftUpdates.fee_due_amount;

  const normalizedOrderStatus = (() => {
    const normalized = (order.status || "pending").toLowerCase();
    return isOrderStatus(normalized) ? normalized : "pending";
  })();

  const hasUnsavedChanges =
    selectedStatus !== normalizedOrderStatus ||
    Number(selectedFeeDueAmount) !== (order.fee_due_amount ?? 0) ||
    Number(selectedAmount) !== (order.tax_payable_amount ?? 0);

  const handleSaveDetails = async () => {
    if (!order._id) return;

    const parsedAmount = Number(selectedAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Payable amount must be a valid positive number");
      return;
    }

    // Send only what actually changed. Paid amounts are locked, so they are
    // never included — this lets the admin edit the status on its own.
    const data: {
      status?: OrderStatus;
      tax_payable_amount?: number;
      fee_due_amount?: number;
    } = {};

    if (selectedStatus !== normalizedOrderStatus) {
      data.status = selectedStatus;
    }
    if (
      !order.is_tax_payable_amount_paid &&
      parsedAmount !== (order.tax_payable_amount ?? 0)
    ) {
      data.tax_payable_amount = parsedAmount;
    }
    if (
      !order.is_fee_due_amount_paid &&
      Number(selectedFeeDueAmount) !== (order.fee_due_amount ?? 0)
    ) {
      data.fee_due_amount = Number(selectedFeeDueAmount);
    }

    if (Object.keys(data).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateTaxOrder({ id: order._id, data }).unwrap();
      toast.success("Order details updated successfully");
    } catch (error) {
      globalErrorHandler(error);
    }
  };

  const remainingAllAmount =
    (order.fee_due_amount ?? 0) + (order.tax_payable_amount ?? 0);

  const cashPaymentOptions = [
    {
      value: "fee_amount",
      label: `Service Fee (৳${order.fee_amount ?? 0})`,
      available: !order.is_fee_amount_paid && (order.fee_amount ?? 0) > 0,
    },
    {
      value: "fee_due_amount",
      label: `Fee Due (৳${order.fee_due_amount ?? 0})`,
      available: !order.is_fee_due_amount_paid && (order.fee_due_amount ?? 0) > 0,
    },
    {
      value: "tax_payable_amount",
      label: `Tax Payable (৳${order.tax_payable_amount ?? 0})`,
      available:
        !order.is_tax_payable_amount_paid &&
        (order.tax_payable_amount ?? 0) > 0,
    },
    {
      value: "remaining_all_amount",
      label: `Remaining All (৳${remainingAllAmount})`,
      available:
        !order.is_tax_payable_amount_paid &&
        !order.is_fee_due_amount_paid &&
        remainingAllAmount > 0,
    },
  ].filter((option) => option.available);

  const handleRecordCashPayment = async () => {
    if (!order._id || !cashPaymentFor) {
      toast.error("Please select what the payment is for");
      return;
    }
    try {
      await recordCashPayment({
        orderId: order._id,
        paymentFor: cashPaymentFor as
          | "fee_amount"
          | "fee_due_amount"
          | "tax_payable_amount"
          | "remaining_all_amount",
      }).unwrap();
      toast.success("Cash payment recorded successfully");
      setCashPaymentFor("");
    } catch (error) {
      globalErrorHandler(error);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.type || !uploadForm.name) {
      toast.error("Please fill all fields and select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append(
      "data",
      JSON.stringify({
        name: uploadForm.name,
        type: uploadForm.type,
        orderId: order._id,
        userId: order.userId,
      }),
    );

    try {
      const result = await uploadFile(formData).unwrap();
      toast.success("File uploaded successfully");
      setUploadedFileId(result.data?._id ?? null);
      setUploadForm({ type: "", name: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      globalErrorHandler(error);
    }
  };

  const requiredDocuments = getRequiredDocuments(order);
  const uploadedByType = new Map(
    (order.documents || []).map((doc) => [doc.type, doc]),
  );

  const handleAdminDocUpload = async (docType: string) => {
    const file = pendingDocFiles[docType];
    if (!file || !order._id) return;
    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);
      await adminUploadDocumentForUser({
        taxId: order._id,
        formData,
      }).unwrap();
      toast.success(`${docType} uploaded successfully`);
      setPendingDocFiles((prev) => ({ ...prev, [docType]: null }));
    } catch (error) {
      globalErrorHandler(error);
    } finally {
      setUploadingDoc(null);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-none shadow-xl ring-1 py-0 ring-black/5">
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
            </div>
            <div className="flex items-center gap-3 self-end sm:self-start">
              <StatusBadge status={order.status} />
              <PaymentStatusBadge order={order} />
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="h-10 gap-2 font-bold shadow-lg shadow-primary/20"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
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
              </div>
              <div className="grid gap-6 rounded-2xl bg-muted/20 p-6 shadow-inner ring-1 ring-black/5">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Full Name
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {order.personal_information?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Email Address
                    </p>
                    <p className="flex items-center text-base font-bold text-foreground">
                      <Mail className="mr-2 h-4 w-4 text-primary opacity-70" />
                      {order.personal_information?.email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Mobile Number
                    </p>
                    <p className="flex items-center text-base font-bold text-foreground">
                      <Phone className="mr-2 h-4 w-4 text-primary opacity-70" />
                      {order.personal_information?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                      Applicant Category
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.personal_information?.are_you_student && (
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none">
                          STUDENT
                        </Badge>
                      )}
                      {order.personal_information?.are_you_house_wife && (
                        <Badge className="bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-none">
                          HOUSEWIFE
                        </Badge>
                      )}
                      {!order.personal_information?.are_you_student &&
                        !order.personal_information?.are_you_house_wife && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">
                            GENERAL
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
                    Tax Types & Income Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.tax_types?.length ||
                    order.source_of_income?.length ? (
                      <>
                        {(order.tax_types || []).map((type, index) => (
                          <Badge
                            key={`tax-type-${type}-${index}`}
                            variant="default"
                            className="px-3 py-1 font-semibold text-[11px]"
                          >
                            {formatTaxTypeLabel(type)}
                          </Badge>
                        ))}
                        {(order.source_of_income || []).map((type, index) => (
                          <Badge
                            key={`${type}-${index}`}
                            variant="secondary"
                            className="px-3 py-1 font-semibold text-[11px] bg-background"
                          >
                            {type}
                          </Badge>
                        ))}
                      </>
                    ) : (
                      <span className="text-sm italic text-muted-foreground font-medium">
                        No tax types or income sources declared
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Fee
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
                      ৳
                      {order.is_fee_amount_paid || order.is_fee_due_amount_paid
                        ? 0
                        : order.fee_amount + order.fee_due_amount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Tax
                    </p>
                    <p className="text-xl font-black text-primary">
                      ৳{order.tax_payable_amount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-muted bg-background p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      Total Paid
                    </p>
                    <p className="text-xl font-black text-emerald-600">
                      ৳{order.total_paid_amount ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section>
              {" "}
              <div className="space-y-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <p className="text-sm font-black uppercase tracking-widest text-foreground">
                    Record Cash Payment
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mark an amount as received in person / cash. This creates a
                  completed payment and updates the paid status.
                </p>
                {cashPaymentOptions.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    All payable amounts are received. Nothing left to record.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="cash_payment_for"
                        className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                      >
                        Payment For
                      </Label>
                      <Select
                        value={cashPaymentFor}
                        onValueChange={setCashPaymentFor}
                      >
                        <SelectTrigger
                          id="cash_payment_for"
                          className="h-14 w-full bg-background border-muted text-base font-bold"
                        >
                          <SelectValue placeholder="Select payment bucket" />
                        </SelectTrigger>
                        <SelectContent>
                          {cashPaymentOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="font-medium"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      className="h-12 w-full font-bold"
                      onClick={handleRecordCashPayment}
                      disabled={isRecordingCash || !cashPaymentFor}
                    >
                      {isRecordingCash ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-5 w-5" />
                          Record Cash Payment
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </section>
            <section>
              <h3 className="mb-5 flex items-center text-xl font-bold text-foreground">
                <History className="mr-3 h-5 w-5 text-primary" />
                Internal System Data
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/20 p-6 shadow-inner ring-1 ring-black/5">
                <div className="space-y-1.5 p-3 rounded-xl bg-background shadow-sm border border-muted/20">
                  <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                    Submission Date
                  </p>
                  <p className="flex items-center text-sm font-black text-foreground">
                    <Calendar className="mr-1.5 h-4 w-4 text-primary opacity-70" />
                    {order?.createdAt
                      ? new Date(order?.createdAt)?.toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Decisions & Details */}
          <div className="space-y-10">
            {/* Files Upload Missing Banner */}
            {order.files_upload_pending && (
              <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 dark:border-amber-500/40 dark:bg-amber-500/10">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  Files Upload Missing
                </h3>
                <p className="mb-4 text-sm text-amber-600 dark:text-amber-300/80">
                  Client chose to upload files later. Upload required documents
                  below on their behalf.
                </p>
                <div className="space-y-2">
                  {requiredDocuments.map((doc) => {
                    const uploaded = uploadedByType.get(doc);
                    const isUploadingThis = uploadingDoc === doc;
                    return (
                      <div
                        key={doc}
                        className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-3 dark:border-amber-500/20 dark:bg-background"
                      >
                        <p className="flex-1 truncate text-sm font-semibold text-foreground">
                          {doc}
                        </p>
                        {uploaded ? (
                          <Badge className="shrink-0 border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Uploaded
                          </Badge>
                        ) : (
                          <div className="flex shrink-0 items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              className="h-8 w-36 cursor-pointer text-xs file:cursor-pointer"
                              onChange={(e) =>
                                setPendingDocFiles((prev) => ({
                                  ...prev,
                                  [doc]: e.target.files?.[0] ?? null,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              className="h-8"
                              disabled={
                                !pendingDocFiles[doc] || isUploadingThis
                              }
                              onClick={() => handleAdminDocUpload(doc)}
                            >
                              {isUploadingThis ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Upload"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

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
                      htmlFor="fee_due_amount"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                    >
                      Add Fee Due Amount (৳)
                      {order.is_fee_due_amount_paid && (
                        <span className="ml-2 text-emerald-600">
                          (already paid)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="fee_due_amount"
                      type="number"
                      min={0}
                      disabled={order.is_fee_due_amount_paid}
                      className="h-14 bg-muted/10 border-muted text-lg font-black disabled:cursor-not-allowed disabled:opacity-60"
                      value={selectedFeeDueAmount}
                      onChange={(event) =>
                        setDraftUpdates((previous) => ({
                          ...previous,
                          fee_due_amount: event.target.value.replace(
                            /^0+(\d)/,
                            "$1",
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="tax_payable_amount"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                    >
                      Add Tax Payable Amount (৳)
                      {order.is_tax_payable_amount_paid && (
                        <span className="ml-2 text-emerald-600">
                          (already paid)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="tax_payable_amount"
                      type="number"
                      min={0}
                      disabled={order.is_tax_payable_amount_paid}
                      className="h-14 bg-muted/10 border-muted text-lg font-black disabled:cursor-not-allowed disabled:opacity-60"
                      value={selectedAmount}
                      onChange={(event) =>
                        setDraftUpdates((previous) => ({
                          ...previous,
                          tax_payable_amount: event.target.value.replace(
                            /^0+(\d)/,
                            "$1",
                          ),
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  className="h-14 w-full text-lg font-black tracking-wide shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleSaveDetails}
                  disabled={isUpdatingOrder || !hasUnsavedChanges}
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
            {order.documents && order.documents.length > 0 && (
              <div className="w-full">
                <h3 className="mb-6 flex items-center text-xl font-bold text-foreground">
                  <FileText className="mr-3 h-5 w-5 text-primary" />
                  Submitted Documentation
                </h3>
                <div className="flex flex-wrap gap-4">
                  {order.documents.map((doc) => (
                    <Link
                      href={`/admin/files/${doc?._id}`}
                      key={doc?._id}
                      className="group flex flex-col items-center w-37.5 gap-3 rounded-2xl border bg-background p-4 text-center transition-all hover:border-primary hover:shadow-xl hover:-translate-y-1 active:scale-95"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white shadow-sm ring-1 ring-primary/10">
                        <FileText className="h-10 w-10" />
                      </div>
                      <div className="space-y-0.5 w-full text-center">
                        <p className="block text-[10px] font-black uppercase tracking-tighter text-muted-foreground truncate">
                          {doc?.type}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={uploadModalOpen}
        onOpenChange={(open) => {
          setUploadModalOpen(open);
          if (!open) setUploadedFileId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
              <Upload className="h-5 w-5 text-primary" />
              Upload File
            </DialogTitle>
          </DialogHeader>

          {uploadedFileId ? (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-extrabold text-foreground">
                  Upload Successful
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  The file has been uploaded to this order.
                </p>
              </div>
              <Link
                href={`/admin/files/${uploadedFileId}`}
                className="w-full"
                onClick={() => setUploadModalOpen(false)}
              >
                <Button className="h-12 w-full font-black tracking-wide shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <FileText className="mr-2 h-5 w-5" />
                  VIEW FILE
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  File Type
                </Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="h-11 w-full bg-muted/10 border-muted font-semibold">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_FILE_TYPES.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="font-medium"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="upload_name"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                  File Name
                </Label>
                <Input
                  id="upload_name"
                  placeholder="e.g. Tax Certificate 2024"
                  className="h-11 bg-muted/10 border-muted font-semibold"
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="upload_file"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground"
                >
                  Select File
                </Label>
                <Input
                  id="upload_file"
                  type="file"
                  ref={fileInputRef}
                  className="h-11 bg-muted/10 border-muted cursor-pointer font-semibold file:mr-3 file:cursor-pointer file:font-bold file:text-primary"
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </div>

              <Button
                className="h-12 w-full font-black tracking-wide shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    UPLOADING...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    UPLOAD FILE
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
