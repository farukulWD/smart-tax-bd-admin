"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncomeSourceForm } from "@/components/income-source/income-source-form";
import { useGetAllIncomeSourcesAdminQuery } from "@/redux/api/income-source/incomeSourceApi";

export default function EditIncomeSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useGetAllIncomeSourcesAdminQuery();
  const incomeSource = data?.data?.find((source) => source._id === id);

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
            Edit Income Source
          </h2>
          <p className="text-sm text-muted-foreground">
            Update the titles, required files, or order.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading income source...
        </div>
      ) : incomeSource ? (
        <IncomeSourceForm incomeSource={incomeSource} />
      ) : (
        <p className="text-sm text-muted-foreground">Income source not found.</p>
      )}
    </div>
  );
}
