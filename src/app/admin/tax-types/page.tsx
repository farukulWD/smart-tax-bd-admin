"use client";

import {
  useGetAllTaxTypesQuery,
  useCreateTaxTypeMutation,
  useUpdateTaxTypeMutation,
  useDeleteTaxTypeMutation,
} from "@/redux/api/tax-type/taxTypeApi";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit, Calculator, HandCoins } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TaxTypesPage() {
  const { data, isLoading } = useGetAllTaxTypesQuery();
  const [createTaxType] = useCreateTaxTypeMutation();
  const [updateTaxType] = useUpdateTaxTypeMutation();
  const [deleteTaxType] = useDeleteTaxTypeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", price: "" });

  const taxTypes = useMemo(() => data?.data ?? [], [data]);

  const averagePrice = useMemo(() => {
    if (!taxTypes.length) return 0;
    const total = taxTypes.reduce((sum: number, type: any) => sum + Number(type.price || 0), 0);
    return Math.round(total / taxTypes.length);
  }, [taxTypes]);

  const handleOpenModal = (type: any = null) => {
    setEditingType(type);
    setFormData(type ? { name: type.name, price: type.price.toString() } : { name: "", price: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await updateTaxType({ id: editingType._id, data: { ...formData, price: Number(formData.price) } }).unwrap();
        toast.success("Tax type updated successfully");
      } else {
        await createTaxType({ ...formData, price: Number(formData.price) }).unwrap();
        toast.success("Tax type created successfully");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tax type?")) {
      try {
        await deleteTaxType(id).unwrap();
        toast.success("Tax type deleted successfully");
      } catch {
        toast.error("Failed to delete tax type");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tax Types</h2>
            <p className="text-sm text-muted-foreground">Maintain tax categories and service pricing for filing operations.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" /> Add Tax Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingType ? "Edit Tax Type" : "Add Tax Type"}</DialogTitle>
                  <DialogDescription>Provide the category name and default service price.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Personal Income Tax"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (BDT)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="500"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingType ? "Update" : "Create"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">{taxTypes.length}</span>
              <Calculator className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Average Price</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">৳{averagePrice}</span>
              <HandCoins className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Tax Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price (BDT)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Loading tax types...
                      </TableCell>
                    </TableRow>
                  ) : taxTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No tax types found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    taxTypes.map((type: any) => (
                      <TableRow key={type._id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>৳{type.price}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(type)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(type._id)}
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
      </div>
    </AdminLayout>
  );
}
