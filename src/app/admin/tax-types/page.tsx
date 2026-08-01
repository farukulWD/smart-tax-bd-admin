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
import {
  Plus,
  Trash2,
  Edit,
  Calculator,
  HandCoins,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { readLocalized, type LocalizedText } from "@/lib/localize";

type TaxTypeValue =
  | "income_tax"
  | "income_tax_government"
  | "income_tax_non_government"
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
  | "wealth_tax"
  | "housewife_tax_return"
  | "agriculture_tax_return"
  | "non_resident_bangladeshis";

type TaxType = {
  _id: string;
  title: LocalizedText | string;
  rate: number;
  value: TaxTypeValue;
  icon?: string;
  tax_orders_id?: string[];
  description: LocalizedText | string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const TAX_TYPE_VALUES: TaxTypeValue[] = [
  "income_tax",
  "income_tax_government",
  "income_tax_non_government",
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
  "housewife_tax_return",
  "agriculture_tax_return",
  "non_resident_bangladeshis",
];

// `icon` used to hold a lucide icon name; it now holds an uploaded image URL.
// Legacy rows are still rendered as plain text so they can be spotted and replaced.
const isIconUrl = (icon?: string) => !!icon && /^https?:\/\//.test(icon);

const formatTaxTypeLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function TaxTypesPage() {
  const { data, isLoading } = useGetAllTaxTypesQuery();
  const [createTaxType, { isLoading: isCreating }] = useCreateTaxTypeMutation();
  const [updateTaxType, { isLoading: isUpdating }] = useUpdateTaxTypeMutation();
  const [deleteTaxType, { isLoading: isDeleting }] =
    useDeleteTaxTypeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<TaxType | null>(null);
  const [formData, setFormData] = useState<{
    titleEn: string;
    titleBn: string;
    rate: string;
    value: TaxTypeValue;
    descriptionEn: string;
    descriptionBn: string;
    isActive: boolean;
  }>({
    titleEn: "",
    titleBn: "",
    rate: "",
    value: "income_tax",
    descriptionEn: "",
    descriptionBn: "",
    isActive: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taxTypes = useMemo<TaxType[]>(() => data?.data ?? [], [data]);

  const isUnchanged = useMemo(() => {
    if (!editingType) return false;
    if (iconFile) return false;
    return (
      formData.titleEn === readLocalized(editingType.title, "en") &&
      formData.titleBn === readLocalized(editingType.title, "bn") &&
      formData.rate === (editingType.rate?.toString() ?? "") &&
      formData.value === (editingType.value ?? "income_tax") &&
      formData.descriptionEn === readLocalized(editingType.description, "en") &&
      formData.descriptionBn === readLocalized(editingType.description, "bn") &&
      formData.isActive === Boolean(editingType.isActive)
    );
  }, [editingType, formData, iconFile]);

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
            titleEn: readLocalized(type.title, "en"),
            titleBn: readLocalized(type.title, "bn"),
            rate: type.rate?.toString() ?? "",
            value: type.value ?? "income_tax",
            descriptionEn: readLocalized(type.description, "en"),
            descriptionBn: readLocalized(type.description, "bn"),
            isActive: Boolean(type.isActive),
          }
        : {
            titleEn: "",
            titleBn: "",
            rate: "",
            value: "income_tax",
            descriptionEn: "",
            descriptionBn: "",
            isActive: true,
          },
    );
    setIconFile(null);
    setIconPreview(isIconUrl(type?.icon) ? (type?.icon ?? null) : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setIconFile(file);
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    } else {
      setIconPreview(
        isIconUrl(editingType?.icon) ? (editingType?.icon ?? null) : null,
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = Number(formData.rate);
    if (Number.isNaN(parsedRate)) {
      toast.error("Rate must be a valid number");
      return;
    }

    const payload = {
      title: { en: formData.titleEn, bn: formData.titleBn },
      rate: parsedRate,
      value: formData.value,
      description: { en: formData.descriptionEn, bn: formData.descriptionBn },
      isActive: formData.isActive,
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    if (iconFile) fd.append("icon", iconFile);

    try {
      if (editingType) {
        await updateTaxType({ id: editingType._id!, data: fd }).unwrap();
        toast.success("Tax type updated successfully");
      } else {
        await createTaxType(fd).unwrap();
        toast.success("Tax type created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      toast.error(message || "Operation failed");
    }
  };

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
                  <Label htmlFor="titleEn">Title (English)</Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleEn: e.target.value })
                    }
                    placeholder="e.g. Income Tax"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="titleBn">Title (বাংলা)</Label>
                  <Input
                    id="titleBn"
                    value={formData.titleBn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleBn: e.target.value })
                    }
                    placeholder="যেমন আয়কর"
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
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionEn: e.target.value,
                      })
                    }
                    placeholder="Add a short description"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descriptionBn">Description (বাংলা)</Label>
                  <Textarea
                    id="descriptionBn"
                    value={formData.descriptionBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionBn: e.target.value,
                      })
                    }
                    placeholder="সংক্ষিপ্ত বিবরণ লিখুন"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    ref={fileInputRef}
                    onChange={handleIconChange}
                  />
                  {iconPreview ? (
                    <div className="relative mt-1 h-16 w-16 overflow-hidden rounded-md border border-border bg-muted">
                      <Image
                        src={iconPreview}
                        alt="Icon preview"
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Square image, at least 128×128. PNG, JPEG or WebP.
                    </p>
                  )}
                  {isIconUrl(editingType?.icon) && !iconFile && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImageIcon className="h-3 w-3" />
                      Existing icon will be kept unless replaced.
                    </p>
                  )}
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
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating || isUnchanged}
                >
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
                  <TableHead className="w-16">Icon</TableHead>
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
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading tax types...
                    </TableCell>
                  </TableRow>
                ) : taxTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
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
                      <TableCell className="max-w-sm truncate">
                        {readLocalized(type.description)}
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
