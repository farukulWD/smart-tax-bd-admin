"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDiscount,
  formatTaka,
  formatValidity,
  isExpired,
  type Coupon,
} from "@/lib/coupon";
import {
  useDeleteCouponMutation,
  useGetAllCouponsAdminQuery,
  useUpdateCouponMutation,
} from "@/redux/api/coupon/couponApi";

const PAGE_LIMIT = 10;

/** Surfaces the server message (e.g. the 409 duplicate-code conflict). */
const errorMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback;

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [discountType, setDiscountType] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetAllCouponsAdminQuery({
    page,
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
    ...(status !== "all" ? { status } : {}),
    ...(discountType !== "all" ? { discountType } : {}),
  });

  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const coupons = useMemo<Coupon[]>(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const handleToggleActive = async (item: Coupon) => {
    try {
      await updateCoupon({
        id: item._id,
        data: { isActive: !item.isActive },
      }).unwrap();
      toast.success(item.isActive ? "Coupon disabled" : "Coupon enabled");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update status"));
    }
  };

  const couponToDelete = coupons.find((item) => item._id === deleteId);
  const deleteUsage = couponToDelete?.usageCount ?? 0;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCoupon(deleteId).unwrap();
      toast.success("Coupon deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete coupon"));
    }
  };

  const columns: Column<Coupon>[] = [
    {
      header: "Code",
      cell: (item) => (
        <div className="max-w-[220px]">
          <span className="block truncate font-mono font-medium">
            {item.code}
          </span>
          {item.description && (
            <span className="block truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Discount",
      cell: (item) => (
        <span className="font-semibold">{formatDiscount(item)}</span>
      ),
    },
    {
      header: "Type",
      cell: (item) => (
        <Badge variant="secondary" className="font-normal">
          {item.discountType === "percentage" ? "Percentage" : "Fixed"}
        </Badge>
      ),
    },
    {
      header: "Validity",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatValidity(item)}
          {isExpired(item) && (
            <Badge variant="destructive" className="ml-2 font-normal">
              Expired
            </Badge>
          )}
        </span>
      ),
    },
    {
      header: "Usage",
      cell: (item) => {
        const used = item.usageCount ?? 0;
        const pending = item.pendingCount ?? 0;
        if (!used && !pending) {
          return (
            <span className="text-xs text-muted-foreground">Never used</span>
          );
        }
        return (
          <div className="text-xs">
            <span className="font-semibold text-foreground">
              {used} {used === 1 ? "order" : "orders"}
            </span>
            {pending > 0 && (
              <span className="text-muted-foreground"> · {pending} pending</span>
            )}
            {used > 0 && (
              <span className="block text-muted-foreground">
                {formatTaka(item.totalDiscount ?? 0)} discounted
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isActive}
            onCheckedChange={() => handleToggleActive(item)}
          />
          <span className="text-xs text-muted-foreground">
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      header: <span className="flex justify-end">Actions</span>,
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/coupons/${item._id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
          <p className="text-sm text-muted-foreground">
            Discount codes customers apply to the service fee at checkout.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/create">
            <Plus className="mr-2 h-4 w-4" /> New Coupon
          </Link>
        </Button>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Coupons</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search code or note..."
                className="w-full pl-8 sm:w-56"
              />
            </div>
            <Select
              value={discountType}
              onValueChange={(value) => {
                setDiscountType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={coupons}
            columns={columns}
            isLoading={isLoading || isFetching}
            loadingMessage="Loading coupons..."
            emptyMessage="No coupons found."
            emptyIcon={<TicketPercent className="h-5 w-5" />}
            rowKey={(item) => item._id}
          />
        </CardContent>
      </Card>

      {totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta?.page ?? page} of {totalPage} · {meta?.total ?? 0} coupons
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        title="Delete coupon"
        description={
          deleteUsage > 0
            ? `This coupon has been used on ${deleteUsage} ${
                deleteUsage === 1 ? "order" : "orders"
              }. Deleting it is permanent; those orders keep the discount they were given.`
            : "This coupon will be permanently deleted. It has not been used on any order."
        }
        confirmText="Delete"
      />
    </div>
  );
}
