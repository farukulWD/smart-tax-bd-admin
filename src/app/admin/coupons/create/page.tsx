"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CouponForm } from "@/components/coupon/coupon-form";

export default function CreateCouponPage() {
  return (
    <div className="space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/coupons">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Coupon</h2>
          <p className="text-sm text-muted-foreground">
            Create a discount code for the service fee.
          </p>
        </div>
      </section>
      <CouponForm />
    </div>
  );
}
