"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Coins, Edit, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import type { IncomeSource } from "@/lib/income-source";
import {
  useDeleteIncomeSourceMutation,
  useGetAllIncomeSourcesAdminQuery,
  useUpdateIncomeSourceMutation,
} from "@/redux/api/income-source/incomeSourceApi";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback;

export default function IncomeSourcesPage() {
  const { data, isLoading } = useGetAllIncomeSourcesAdminQuery();
  const [updateIncomeSource] = useUpdateIncomeSourceMutation();
  const [deleteIncomeSource, { isLoading: isDeleting }] =
    useDeleteIncomeSourceMutation();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const incomeSources = useMemo<IncomeSource[]>(() => data?.data ?? [], [data]);

  const handleToggleActive = async (item: IncomeSource) => {
    try {
      await updateIncomeSource({
        id: item._id,
        data: { isActive: !item.isActive },
      }).unwrap();
      toast.success(
        item.isActive ? "Income source disabled" : "Income source enabled",
      );
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteIncomeSource(deleteId).unwrap();
      toast.success("Income source deleted successfully");
    } catch (error) {
      // The server refuses with 409 while orders still declare this source.
      toast.error(errorMessage(error, "Failed to delete income source"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Income Sources</h2>
          <p className="text-sm text-muted-foreground">
            The income sources users pick when creating an order, and the
            documents each one requires.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/income-sources/create">
            <Plus className="mr-2 h-4 w-4" /> Add Income Source
          </Link>
        </Button>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">All Income Sources</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Required Files</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading income sources...
                    </TableCell>
                  </TableRow>
                ) : incomeSources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Coins className="h-5 w-5" />
                        No income sources found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeSources.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <span className="block max-w-xs truncate font-medium">
                          {item.value}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-xs truncate">
                          {item.title?.en || "—"}
                        </span>
                        <span className="block max-w-xs truncate text-xs text-muted-foreground">
                          {item.title?.bn || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-sm flex-wrap gap-1">
                          {(item.required_files ?? []).length ? (
                            (item.required_files ?? []).map((file) => (
                              <Badge key={file._id} variant="secondary">
                                {file.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Legacy built-in list
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleActive(item)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/admin/income-sources/${item._id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete this income source?"
        description="Users will no longer be able to pick it. Sources already used by an order cannot be deleted — disable them instead."
        confirmText="Delete"
        loading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
