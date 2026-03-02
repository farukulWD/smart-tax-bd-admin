"use client";

import { useEffect, useMemo } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGetMeQuery, useUpdateMeMutation } from "@/redux/api/auth/authApi";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.union([z.literal(""), z.email("Invalid email address")]),
  mobile: z.string().min(1, "Mobile number is missing"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: meData, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const me = meData?.data;

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
    },
  });

  useEffect(() => {
    if (!me) return;
    form.reset({
      name: me.name ?? "",
      email: me.email ?? "",
      mobile: me.mobile ?? "",
    });
  }, [me, form]);

  const currentRole = useMemo(() => me?.role ?? "admin", [me?.role]);
  const currentStatus = useMemo(() => me?.status ?? "active", [me?.status]);

  const onSubmit = async (values: ProfileValues) => {
    if (!me?.mobile) {
      toast.error("Could not identify current user");
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim() || undefined,
    };

    const isNameChanged = payload.name !== (me.name ?? "");
    const isEmailChanged = (payload.email ?? "") !== (me.email ?? "");

    if (!isNameChanged && !isEmailChanged) {
      toast.info("No profile changes to save");
      return;
    }

    try {
      await updateMe({ mobile: me.mobile, data: payload }).unwrap();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your admin account information used across the Smart Tax BD portal.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="capitalize">
                {currentRole}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={currentStatus === "active" ? "default" : "destructive"} className="capitalize">
                {currentStatus}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Account Security</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Session protected by token auth
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your name and email. Mobile is read-only and used as your unique identity.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Your full name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="name@example.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input className="pl-10" disabled {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
