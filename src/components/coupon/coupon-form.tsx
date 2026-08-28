"use client";

import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DISCOUNT_TYPES, discountTypeLabel, type Coupon } from "@/lib/coupon";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from "@/redux/api/coupon/couponApi";

const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(32, "Code must be at most 32 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Only letters, numbers, - and _ are allowed"),
    description: z.string().trim(),
    discountType: z.enum(DISCOUNT_TYPES),
    // Numbers are held as strings in form state and converted on submit —
    // the repo convention for numeric inputs.
    discountValue: z
      .string()
      .trim()
      .min(1, "Discount value is required")
      .refine(
        (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
        "Discount value must be greater than 0",
      ),
    validFrom: z.date().optional(),
    validUntil: z.date().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      data.discountType !== "percentage" || Number(data.discountValue) <= 100,
    {
      message: "A percentage discount cannot exceed 100",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) =>
      !data.validFrom ||
      !data.validUntil ||
      data.validUntil.getTime() > data.validFrom.getTime(),
    { message: "Valid until must be after valid from", path: ["validUntil"] },
  );

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon;
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      description: coupon?.description ?? "",
      discountType: coupon?.discountType ?? "percentage",
      discountValue: coupon?.discountValue?.toString() ?? "",
      validFrom: coupon?.validFrom ? new Date(coupon.validFrom) : undefined,
      validUntil: coupon?.validUntil ? new Date(coupon.validUntil) : undefined,
      isActive: coupon?.isActive ?? true,
    },
  });

  // `useWatch` rather than `form.watch()` — the latter returns a fresh function
  // each render, which the React Compiler cannot memoize.
  const discountType = useWatch({
    control: form.control,
    name: "discountType",
  });
  const noChanges = !!coupon && !form.formState.isDirty;

  const onSubmit = async (values: CouponFormValues) => {
    const payload = {
      code: values.code.toUpperCase(),
      description: values.description || undefined,
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      // null clears a previously set bound; undefined would leave it untouched.
      validFrom: values.validFrom ? values.validFrom.toISOString() : null,
      validUntil: values.validUntil ? values.validUntil.toISOString() : null,
      isActive: values.isActive,
    };

    try {
      if (coupon) {
        await updateCoupon({ id: coupon._id, data: payload }).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(payload).unwrap();
        toast.success("Coupon created successfully");
      }
      router.push("/admin/coupons");
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SAVE20"
                      className="uppercase"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Stored uppercase. Customers can type it in any case.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISCOUNT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {discountTypeLabel[type]}
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
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {discountType === "percentage"
                        ? "Discount (%)"
                        : "Discount (৳)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={discountType === "percentage" ? 100 : undefined}
                        step="any"
                        placeholder={
                          discountType === "percentage" ? "20" : "500"
                        }
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
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From (optional)</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Active immediately"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until (optional)</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Never expires"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="e.g. Eid campaign, partner referral"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Admin-only. Never shown to customers.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            {coupon ? "Update Coupon" : "Create Coupon"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/coupons")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
