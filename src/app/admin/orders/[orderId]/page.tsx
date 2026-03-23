"use client";

import { useGetSingleTaxOrderQuery } from "@/redux/api/order/orderApi";
import { useParams } from "next/navigation";
import { OrderDetailsCard } from "@/components/orders/OrderDetailsCard";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { data: fetchedOrderData, isFetching } = useGetSingleTaxOrderQuery(
    orderId as string,
    {
      skip: !orderId,
    },
  );

  const { tax_order } = fetchedOrderData?.data || {};
  console.log(tax_order);

  if (isFetching) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-20 animate-in fade-in transition-all">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
        <p className="text-xl font-medium text-muted-foreground">
          Loading order information...
        </p>
      </div>
    );
  }

  if (!tax_order) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-6 text-center py-20">
        <div className="rounded-full bg-destructive/10 p-6 text-destructive ring-8 ring-destructive/5">
          <ArrowLeft className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
          <p className="max-w-xs text-muted-foreground">
            The order you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline" className="h-11 px-8 font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted-foreground/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Manage Order
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              Review and update customer tax submission
            </p>
          </div>
        </div>
      </div>

      <OrderDetailsCard key={tax_order._id} order={tax_order} />
    </div>
  );
}

export default OrderDetailsPage;
