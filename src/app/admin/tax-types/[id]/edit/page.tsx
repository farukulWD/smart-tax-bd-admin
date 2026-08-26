"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxTypeForm } from "@/components/tax-type/tax-type-form";
import { useGetAllTaxTypesQuery } from "@/redux/api/tax-type/taxTypeApi";

export default function EditTaxTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useGetAllTaxTypesQuery();
  const taxType = data?.data?.find((type) => type._id === id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tax-types">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Tax Type</h2>
          <p className="text-sm text-muted-foreground">
            Update the title, rate, description, or icon.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tax type...
        </div>
      ) : taxType ? (
        <TaxTypeForm taxType={taxType} />
      ) : (
        <p className="text-sm text-muted-foreground">Tax type not found.</p>
      )}
    </div>
  );
}
