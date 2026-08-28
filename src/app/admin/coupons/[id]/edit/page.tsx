"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponForm } from "@/components/coupon/coupon-form";
import { formatTaka } from "@/lib/coupon";
import { useGetSingleCouponAdminQuery } from "@/redux/api/coupon/couponApi";

export default function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // Fetched by id rather than found in a cached list — the coupon list is
  // paginated server-side, so the row may not be in the cache.
  const { data, isLoading } = useGetSingleCouponAdminQuery(id);
  const coupon = data?.data;

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/coupons">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Coupon</h2>
          <p className="text-sm text-muted-foreground">
            Update the code, discount, validity window, or status.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading coupon...
        </div>
      ) : coupon ? (
        <>
          {(coupon.usageCount ?? 0) > 0 && (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              Used on{" "}
              <span className="font-semibold text-foreground">
                {coupon.usageCount}{" "}
                {coupon.usageCount === 1 ? "order" : "orders"}
              </span>{" "}
              ({formatTaka(coupon.totalDiscount ?? 0)} discounted so far).
              Editing the discount only affects orders that apply it from now
              on — placed orders keep the discount they were given.
            </div>
          )}
          <CouponForm coupon={coupon} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Coupon not found.</p>
      )}
    </div>
  );
}
