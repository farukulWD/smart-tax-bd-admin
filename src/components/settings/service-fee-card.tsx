"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Banknote, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/redux/api/settings/settingsApi";

const serviceFeeSchema = z.object({
  // Held as a string in form state and converted on submit — the repo
  // convention for numeric inputs.
  service_fee: z
    .string()
    .trim()
    .min(1, "Service fee is required")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
      "Service fee must be 0 or more",
    ),
});

type ServiceFeeFormValues = z.infer<typeof serviceFeeSchema>;

function ServiceFeeForm({ serviceFee }: { serviceFee: number }) {
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();

  const form = useForm<ServiceFeeFormValues>({
    resolver: zodResolver(serviceFeeSchema),
    defaultValues: { service_fee: serviceFee.toString() },
  });

  const onSubmit = async (values: ServiceFeeFormValues) => {
    try {
      const res = await updateSettings({
        service_fee: Number(values.service_fee),
      }).unwrap();
      form.reset({ service_fee: res.data.service_fee.toString() });
      toast.success("Service fee updated successfully");
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      toast.error(message || "Failed to update service fee");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:flex-row sm:items-start"
      >
        <FormField
          control={form.control}
          name="service_fee"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Service fee (BDT)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="any" {...field} />
              </FormControl>
              <FormDescription>
                Applies to new tax orders only. Existing orders keep the fee
                they were created with.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="sm:mt-[22px]"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  );
}

export function ServiceFeeCard() {
  const { data, isLoading, isError } = useGetSettingsQuery();
  const serviceFee = data?.data?.service_fee;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-4 w-4 text-primary" />
          Tax Service Fee
        </CardTitle>
        <CardDescription>
          The service fee charged when a customer places a tax order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : isError || serviceFee === undefined ? (
          <p className="text-sm text-destructive">
            Could not load the current service fee.
          </p>
        ) : (
          <ServiceFeeForm key={serviceFee} serviceFee={serviceFee} />
        )}
      </CardContent>
    </Card>
  );
}
