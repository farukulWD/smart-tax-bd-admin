"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncomeSourceForm } from "@/components/income-source/income-source-form";

export default function CreateIncomeSourcePage() {
  return (
    <div className="space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/income-sources">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            New Income Source
          </h2>
          <p className="text-sm text-muted-foreground">
            Add an income source and the documents it requires.
          </p>
        </div>
      </section>

      <IncomeSourceForm />
    </div>
  );
}
