"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxTypeForm } from "@/components/tax-type/tax-type-form";

export default function CreateTaxTypePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tax-types">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Tax Type</h2>
          <p className="text-sm text-muted-foreground">
            Add a tax category with its rate and description.
          </p>
        </div>
      </section>

      <TaxTypeForm />
    </div>
  );
}
