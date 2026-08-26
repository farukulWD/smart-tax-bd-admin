"use client";

import {
  useGetAllTaxTypesQuery,
  useDeleteTaxTypeMutation,
} from "@/redux/api/tax-type/taxTypeApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit,
  Calculator,
  HandCoins,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { readLocalized } from "@/lib/localize";
import {
  formatTaxTypeLabel,
  isIconUrl,
  type TaxType,
} from "@/lib/tax-type";

export default function TaxTypesPage() {
  const { data, isLoading } = useGetAllTaxTypesQuery();
  const [deleteTaxType, { isLoading: isDeleting }] =
    useDeleteTaxTypeMutation();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const taxTypes = useMemo<TaxType[]>(() => data?.data ?? [], [data]);

  const averageRate = useMemo(() => {
    if (!taxTypes.length) return 0;
    const total = taxTypes.reduce(
      (sum, type) => sum + Number(type.rate || 0),
      0,
    );
    return Math.round(total / taxTypes.length);
  }, [taxTypes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTaxType(deleteId).unwrap();
      toast.success("Tax type deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete tax type");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Types</h2>
          <p className="text-sm text-muted-foreground">
            Maintain tax categories and rates for filing operations.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tax-types/create">
            <Plus className="mr-2 h-4 w-4" /> Add Tax Type
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{taxTypes.length}</span>
            <Calculator className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Average Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{averageRate}%</span>
            <HandCoins className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Tax Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading tax types...
                    </TableCell>
                  </TableRow>
                ) : taxTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No tax types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  taxTypes.map((type) => (
                    <TableRow key={type._id}>
                      <TableCell>
                        {isIconUrl(type.icon) ? (
                          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-border bg-muted">
                            <Image
                              src={type.icon!}
                              alt={readLocalized(type.title)}
                              fill
                              unoptimized
                              className="object-contain p-0.5"
                            />
                          </div>
                        ) : type.icon ? (
                          <span className="text-xs text-muted-foreground">
                            {type.icon}
                          </span>
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {readLocalized(type.title)}
                      </TableCell>
                      <TableCell>{formatTaxTypeLabel(type.value)}</TableCell>
                      <TableCell>{type.rate}%</TableCell>
                      <TableCell>
                        <Badge variant={type.isActive ? "default" : "outline"}>
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/tax-types/${type._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteId(type._id ?? null)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        title="Delete tax type"
        description="This tax type will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
