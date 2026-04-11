"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calculator,
  Files,
  ArrowRight,
  Clock3,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { useGetUsersQuery } from "@/redux/api/user/userApi";
import { useGetAllTaxOrdersQuery } from "@/redux/api/order/orderApi";
import { useGetAllTaxTypesQuery } from "@/redux/api/tax-type/taxTypeApi";
import { useGetAllFilesQuery } from "@/redux/api/file/fileApi";

const quickActions = [
  { label: "Review Tax Orders", href: "/admin/orders", icon: FileText },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Update Tax Types", href: "/admin/tax-types", icon: Calculator },
  { label: "Audit Uploaded Files", href: "/admin/files", icon: Files },
];

export default function AdminDashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery();
  const { data: ordersData, isLoading: ordersLoading } =
    useGetAllTaxOrdersQuery();
  const { data: taxTypesData, isLoading: taxTypesLoading } =
    useGetAllTaxTypesQuery();
  const { data: filesData, isLoading: filesLoading } = useGetAllFilesQuery();

  const totalUsers = usersData?.data?.length ?? 0;
  const allOrders = ordersData?.data ?? [];
  const pendingOrders = allOrders.filter(
    (o) => o.status?.toLowerCase() === "pending",
  ).length;
  const totalTaxTypes = taxTypesData?.data?.length ?? 0;
  const totalFiles = filesData?.data?.length ?? 0;

  const recentOrders = [...allOrders]
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  const stats = [
    {
      name: "Total Users",
      value: usersLoading ? "—" : totalUsers.toLocaleString(),
      helper: usersLoading ? "Loading..." : `${totalUsers} registered users`,
      icon: Users,
    },
    {
      name: "Pending Orders",
      value: ordersLoading ? "—" : pendingOrders.toLocaleString(),
      helper: ordersLoading ? "Loading..." : "Needs review today",
      icon: Clock3,
    },
    {
      name: "Tax Types",
      value: taxTypesLoading ? "—" : totalTaxTypes.toLocaleString(),
      helper: taxTypesLoading ? "Loading..." : `${totalTaxTypes} active types`,
      icon: Calculator,
    },
    {
      name: "Documents",
      value: filesLoading ? "—" : totalFiles.toLocaleString(),
      helper: filesLoading ? "Loading..." : `${totalFiles} files uploaded`,
      icon: Files,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">Operational Overview</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Smart Tax BD Admin Dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Track users, monitor filing requests, and keep tax processing
          workflows moving with a single control panel.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.helper}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Recent Orders Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersLoading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="block rounded-lg border border-border bg-background px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                >
                  <span className="font-medium">
                    Order #{order._id?.slice(-6).toUpperCase()}
                  </span>
                  {" — "}
                  <span className="capitalize text-muted-foreground">
                    {order.status}
                  </span>
                  {order.personal_information?.name && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {order.personal_information.name}
                    </span>
                  )}
                </Link>
              ))
            )}
            <Button asChild variant="outline" className="mt-2 w-full sm:w-auto">
              <Link href="/admin/orders">
                Open Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                asChild
                variant="ghost"
                className="w-full justify-between border border-transparent hover:border-border hover:bg-accent/70"
              >
                <Link href={action.href}>
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-primary" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
