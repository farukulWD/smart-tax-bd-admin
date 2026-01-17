"use client";

import { 
  useGetAllTaxTypesQuery, 
  useCreateTaxTypeMutation, 
  useUpdateTaxTypeMutation, 
  useDeleteTaxTypeMutation 
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
import { Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
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

export default function TaxTypesPage() {
  const { data, isLoading } = useGetAllTaxTypesQuery();
  const [createTaxType] = useCreateTaxTypeMutation();
  const [updateTaxType] = useUpdateTaxTypeMutation();
  const [deleteTaxType] = useDeleteTaxTypeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", price: "" });

  const taxTypes = data?.data || [];

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
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this tax type?")) {
      try {
        await deleteTaxType(id).unwrap();
        toast.success("Tax type deleted successfully");
      } catch (error) {
        toast.error("Failed to delete tax type");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tax Types</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage different categories of taxes and their pricing.
            </p>
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
                  <DialogDescription>
                    Fill in the details for the tax category.
                  </DialogDescription>
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
        </div>

        <div className="rounded-md border bg-white dark:bg-zinc-900 overflow-hidden">
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
                  <TableCell colSpan={3} className="h-24 text-center">
                    Loading tax types...
                  </TableCell>
                </TableRow>
              ) : taxTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No tax types found.
                  </TableCell>
                </TableRow>
              ) : (
                taxTypes.map((type: any) => (
                  <TableRow key={type._id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.price}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(type)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(type._id)}>
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
      </div>
    </AdminLayout>
  );
}
