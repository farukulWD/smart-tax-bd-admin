"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { readLocalized } from "@/lib/localize";
import {
  formatTaxTypeLabel,
  isIconUrl,
  TAX_TYPE_VALUES,
  type TaxType,
} from "@/lib/tax-type";
import { useGetAllFileNamesQuery } from "@/redux/api/file-name/fileNameApi";
import {
  useCreateTaxTypeMutation,
  useUpdateTaxTypeMutation,
} from "@/redux/api/tax-type/taxTypeApi";

const taxTypeSchema = z.object({
  titleEn: z.string().trim().min(1, "English title is required"),
  titleBn: z.string().trim().min(1, "Bangla title is required"),
  value: z.enum(TAX_TYPE_VALUES),
  rate: z
    .string()
    .trim()
    .min(1, "Rate is required")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Rate must be a valid non-negative number",
    ),
  descriptionEn: z.string().trim().min(1, "English description is required"),
  descriptionBn: z.string().trim().min(1, "Bangla description is required"),
  requiredFiles: z.array(z.string()),
  isActive: z.boolean(),
});

type TaxTypeFormValues = z.infer<typeof taxTypeSchema>;

interface TaxTypeFormProps {
  taxType?: TaxType;
}

export function TaxTypeForm({ taxType }: TaxTypeFormProps) {
  const router = useRouter();
  const [createTaxType, { isLoading: isCreating }] = useCreateTaxTypeMutation();
  const [updateTaxType, { isLoading: isUpdating }] = useUpdateTaxTypeMutation();
  const isSaving = isCreating || isUpdating;
  const { data: fileNamesResponse, isLoading: isFileNamesLoading } =
    useGetAllFileNamesQuery();

  const fileNameOptions = (fileNamesResponse?.data ?? []).map((fileName) => ({
    value: fileName._id,
    label: fileName.name,
  }));

  const form = useForm<TaxTypeFormValues>({
    resolver: zodResolver(taxTypeSchema),
    defaultValues: {
      titleEn: readLocalized(taxType?.title, "en"),
      titleBn: readLocalized(taxType?.title, "bn"),
      value: taxType?.value ?? "income_tax",
      rate: taxType?.rate?.toString() ?? "",
      descriptionEn: readLocalized(taxType?.description, "en"),
      descriptionBn: readLocalized(taxType?.description, "bn"),
      requiredFiles: taxType?.required_files?.map((file) => file._id) ?? [],
      isActive: taxType?.isActive ?? true,
    },
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(
    isIconUrl(taxType?.icon) ? (taxType?.icon ?? null) : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const noChanges = !!taxType && !form.formState.isDirty && !iconFile;

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setIconFile(file);
    if (file) {
      setIconPreview(URL.createObjectURL(file));
    } else {
      setIconPreview(
        isIconUrl(taxType?.icon) ? (taxType?.icon ?? null) : null,
      );
    }
  };

  const onSubmit = async (values: TaxTypeFormValues) => {
    const payload = {
      title: { en: values.titleEn, bn: values.titleBn },
      rate: Number(values.rate),
      value: values.value,
      description: { en: values.descriptionEn, bn: values.descriptionBn },
      required_files: values.requiredFiles,
      isActive: values.isActive,
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    if (iconFile) fd.append("icon", iconFile);

    try {
      if (taxType) {
        await updateTaxType({ id: taxType._id, data: fd }).unwrap();
        toast.success("Tax type updated successfully");
      } else {
        await createTaxType(fd).unwrap();
        toast.success("Tax type created successfully");
      }
      router.push("/admin/tax-types");
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      toast.error(message || "Operation failed");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="grid gap-5 pt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Income Tax" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (বাংলা)</FormLabel>
                    <FormControl>
                      <Input placeholder="যেমন আয়কর" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tax value" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAX_TYPE_VALUES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {formatTaxTypeLabel(item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="15"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Add a short description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (বাংলা)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="সংক্ষিপ্ত বিবরণ লিখুন"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requiredFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Files</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={fileNameOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isFileNamesLoading}
                      placeholder={
                        isFileNamesLoading
                          ? "Loading file names..."
                          : "Select the documents users must upload"
                      }
                      searchPlaceholder="Search file names..."
                      emptyText="No file names yet — add them under File Names."
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Shown as upload slots on the client and app for every order
                    that includes this tax type. Leave empty to keep the legacy
                    built-in list for this tax type.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              {isIconUrl(taxType?.icon) && !iconFile && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ImageIcon className="h-3 w-3" />
                  Existing icon will be kept unless replaced.
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving || noChanges}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {taxType ? "Update Tax Type" : "Create Tax Type"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/tax-types")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
