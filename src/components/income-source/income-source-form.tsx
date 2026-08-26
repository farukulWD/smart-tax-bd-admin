"use client";

import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import type { IncomeSource } from "@/lib/income-source";
import { useGetAllFileNamesQuery } from "@/redux/api/file-name/fileNameApi";
import {
  useCreateIncomeSourceMutation,
  useUpdateIncomeSourceMutation,
} from "@/redux/api/income-source/incomeSourceApi";

const incomeSourceSchema = z.object({
  value: z.string().trim().min(1, "Value is required"),
  titleEn: z.string().trim().min(1, "English title is required"),
  titleBn: z.string().trim().min(1, "Bangla title is required"),
  requiredFiles: z.array(z.string()),
  order: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
      "Order must be a non-negative number",
    ),
  isActive: z.boolean(),
});

type IncomeSourceFormValues = z.infer<typeof incomeSourceSchema>;

interface IncomeSourceFormProps {
  incomeSource?: IncomeSource;
}

export function IncomeSourceForm({ incomeSource }: IncomeSourceFormProps) {
  const router = useRouter();
  const [createIncomeSource, { isLoading: isCreating }] =
    useCreateIncomeSourceMutation();
  const [updateIncomeSource, { isLoading: isUpdating }] =
    useUpdateIncomeSourceMutation();
  const isSaving = isCreating || isUpdating;

  const { data: fileNamesResponse, isLoading: isFileNamesLoading } =
    useGetAllFileNamesQuery();

  const fileNameOptions = (fileNamesResponse?.data ?? []).map((fileName) => ({
    value: fileName._id,
    label: fileName.name,
  }));

  const form = useForm<IncomeSourceFormValues>({
    resolver: zodResolver(incomeSourceSchema),
    defaultValues: {
      value: incomeSource?.value ?? "",
      titleEn: incomeSource?.title?.en ?? "",
      titleBn: incomeSource?.title?.bn ?? "",
      requiredFiles: incomeSource?.required_files?.map((file) => file._id) ?? [],
      order: incomeSource?.order?.toString() ?? "",
      isActive: incomeSource?.isActive ?? true,
    },
  });

  const noChanges = !!incomeSource && !form.formState.isDirty;

  const onSubmit = async (values: IncomeSourceFormValues) => {
    const payload = {
      value: values.value,
      title: { en: values.titleEn, bn: values.titleBn },
      required_files: values.requiredFiles,
      isActive: values.isActive,
      ...(values.order === "" ? {} : { order: Number(values.order) }),
    };

    try {
      if (incomeSource) {
        await updateIncomeSource({ id: incomeSource._id, data: payload }).unwrap();
        toast.success("Income source updated successfully");
      } else {
        await createIncomeSource(payload).unwrap();
        toast.success("Income source created successfully");
      }
      router.push("/admin/income-sources");
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
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Income from Rent" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {incomeSource
                      ? "Stored on every order that declared this source — renaming it detaches those orders."
                      : "Stored on the order and submitted by the app. Pick it carefully; it is a key, not a label."}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Rental income" {...field} />
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
                      <Input placeholder="যেমন ভাড়ার আয়" {...field} />
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
                    that declares this income source. Leave empty to keep the
                    legacy built-in list for it.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Appended to the end if left blank"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between self-end rounded-md border p-3">
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
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving || noChanges}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {incomeSource ? "Update Income Source" : "Create Income Source"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/income-sources")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
