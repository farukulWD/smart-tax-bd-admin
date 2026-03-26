"use client";

import {
  useGetAllTaxTypesQuery,
  useCreateTaxTypeMutation,
  useUpdateTaxTypeMutation,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TaxTypeValue =
  | "income_tax"
  | "house_rental_tax"
  | "property_tax"
  | "business_tax"
  | "import_duty"
  | "vat"
  | "excise_duty"
  | "customs_duty"
  | "capital_gains_tax"
  | "gift_tax"
  | "inheritance_tax"
  | "sales_tax"
  | "service_tax"
  | "entertainment_tax"
  | "environmental_tax"
  | "wealth_tax";

type TaxType = {
  _id: string;
  title: string;
  rate: number;
  value: TaxTypeValue;
  icon?: string;
  tax_orders_id?: string[];
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const TAX_TYPE_VALUES: TaxTypeValue[] = [
  "income_tax",
  "house_rental_tax",
  "property_tax",
  "business_tax",
  "import_duty",
  "vat",
  "excise_duty",
  "customs_duty",
  "capital_gains_tax",
  "gift_tax",
  "inheritance_tax",
  "sales_tax",
  "service_tax",
  "entertainment_tax",
  "environmental_tax",
  "wealth_tax",
];

const formatTaxTypeLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function TaxTypesPage() {
  const { data, isLoading } = useGetAllTaxTypesQuery();
  const [createTaxType] = useCreateTaxTypeMutation();
  const [updateTaxType] = useUpdateTaxTypeMutation();
  const [deleteTaxType] = useDeleteTaxTypeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TaxType | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    rate: string;
    value: TaxTypeValue;
    description: string;
    isActive: boolean;
    icon: string;
  }>({
    title: "",
    rate: "",
    value: "income_tax",
    description: "",
    isActive: true,
    icon: "",
  });

  const taxTypes = useMemo<TaxType[]>(() => data?.data ?? [], [data]);

  const averageRate = useMemo(() => {
    if (!taxTypes.length) return 0;
    const total = taxTypes.reduce(
      (sum, type) => sum + Number(type.rate || 0),
      0,
    );
    return Math.round(total / taxTypes.length);
  }, [taxTypes]);

  const handleOpenModal = (type: TaxType | null = null) => {
    setEditingType(type);
    setFormData(
      type
        ? {
            title: type.title ?? "",
            rate: type.rate?.toString() ?? "",
            value: type.value ?? "income_tax",
            description: type.description ?? "",
            isActive: Boolean(type.isActive),
            icon: type.icon ?? "",
          }
        : {
            title: "",
            rate: "",
            value: "income_tax",
            description: "",
            isActive: true,
            icon: "",
          },
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = Number(formData.rate);
    if (Number.isNaN(parsedRate)) {
      toast.error("Rate must be a valid number");
      return;
    }

    const payload = {
      title: formData.title,
      rate: parsedRate,
      value: formData.value,
      description: formData.description,
      isActive: formData.isActive,
      icon: formData.icon || undefined,
    };

    try {
      if (editingType) {
        await updateTaxType({ id: editingType._id!, data: payload }).unwrap();
        toast.success("Tax type updated successfully");
      } else {
        await createTaxType(payload).unwrap();
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
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Types</h2>
          <p className="text-sm text-muted-foreground">
            Maintain tax categories and rates for filing operations.
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
                <DialogTitle>
                  {editingType ? "Edit Tax Type" : "Add Tax Type"}
                </DialogTitle>
                <DialogDescription>
                  Provide title, value, rate, and description.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Income Tax"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Select
                    value={formData.value}
                    onValueChange={(value) =>
                      setFormData({ ...formData, value: value as TaxTypeValue })
                    }
                  >
                    <SelectTrigger id="value" className="w-full">
                      <SelectValue placeholder="Select tax value" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_TYPE_VALUES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {formatTaxTypeLabel(item)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate">Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    min={0}
                    step="any"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                    placeholder="15"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Add a short description"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="calculator"
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingType ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
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
                      <TableCell className="font-medium">
                        {type.title}
                      </TableCell>
                      <TableCell>{formatTaxTypeLabel(type.value)}</TableCell>
                      <TableCell>{type.rate}%</TableCell>
                      <TableCell>
                        <Badge variant={type.isActive ? "default" : "outline"}>
                          {type.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-sm truncate">
                        {type.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(type)}
                          >
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
  );
}
