"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileText,
  Calculator,
  Files,
  ArrowRight,
  Clock3,
  Wallet,
  ShieldCheck,
  BanknoteArrowDown,
  TrendingUp,
  PieChart,
  UserPlus,
  Layers,
} from "lucide-react";
import { useGetAllTaxOrdersQuery } from "@/redux/api/order/orderApi";
import {
  useGetDashboardChartsQuery,
  useGetDashboardStatsQuery,
  type TDashboardRange,
} from "@/redux/api/dashboard/dashboardApi";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ChartCard } from "@/components/dashboard/chart-card";
import { RangeSelector } from "@/components/dashboard/range-selector";
import { TrendAreaChart } from "@/components/dashboard/trend-area-chart";
import { CategoryBarChart } from "@/components/dashboard/category-bar-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import {
  formatBDT,
  formatCount,
  humanizeStatus,
} from "@/components/dashboard/dashboard-utils";

const quickActions = [
  { label: "Review Tax Orders", href: "/admin/orders", icon: FileText },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Update Tax Types", href: "/admin/tax-types", icon: Calculator },
  { label: "Audit Uploaded Files", href: "/admin/files", icon: Files },
];

const RANGE_LABEL: Record<TDashboardRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "12m": "Last 12 months",
};

export default function AdminDashboardPage() {
  const [range, setRange] = useState<TDashboardRange>("30d");

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetDashboardStatsQuery();

  const {
    data: chartsData,
    isFetching: chartsFetching,
    isError: chartsError,
  } = useGetDashboardChartsQuery(range);

  // The recent-orders list still needs order documents; the counters no longer do.
  const { data: ordersData, isLoading: ordersLoading } =
    useGetAllTaxOrdersQuery();

  const stats = statsData?.data;
  const charts = chartsData?.data;
  const periodLabel = RANGE_LABEL[range];

  const recentOrders = useMemo(() => {
    const allOrders = ordersData?.data ?? [];
    return [...allOrders]
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);
  }, [ordersData]);

  const statusData = useMemo(
    () =>
      (charts?.statusBreakdown ?? []).map((row) => ({
        label: humanizeStatus(row.status),
        count: row.count,
      })),
    [charts],
  );

  const tiles = [
    {
      name: "Total Users",
      value: formatCount(stats?.totalUsers ?? 0),
      helper: `${formatCount(stats?.activeUsers ?? 0)} active`,
      icon: Users,
    },
    {
      name: "Orders In Progress",
      value: formatCount(stats?.ordersInProgress ?? 0),
      helper: `of ${formatCount(stats?.totalOrders ?? 0)} total orders`,
      icon: Clock3,
    },
    {
      name: "Collected",
      value: formatBDT(stats?.totalCollected ?? 0),
      helper: `${formatBDT(stats?.feeRevenue ?? 0)} fee revenue`,
      icon: Wallet,
    },
    {
      name: "Outstanding",
      value: formatBDT(stats?.totalOutstanding ?? 0),
      helper: "Unpaid balance on open orders",
      icon: BanknoteArrowDown,
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
        {tiles.map((tile) => (
          <StatTile
            key={tile.name}
            name={tile.name}
            value={tile.value}
            helper={tile.helper}
            icon={tile.icon}
            isLoading={statsLoading || statsError}
          />
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Showing {periodLabel.toLowerCase()}
        </p>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      <section className="grid gap-4 xl:grid-cols-5">
        <ChartCard
          title="Orders over time"
          description={periodLabel}
          icon={TrendingUp}
          className="xl:col-span-3"
          isLoading={chartsFetching}
          isError={chartsError}
          isEmpty={!charts?.ordersOverTime?.length}
        >
          <TrendAreaChart
            data={charts?.ordersOverTime ?? []}
            range={range}
            label="Orders"
          />
        </ChartCard>

        <ChartCard
          title="Order status"
          description={periodLabel}
          icon={PieChart}
          className="xl:col-span-2"
          isLoading={chartsFetching}
          isError={chartsError}
          isEmpty={!statusData.length}
        >
          <CategoryBarChart data={statusData} measureLabel="Orders" />
        </ChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <ChartCard
          title="Collected vs outstanding"
          description={`${periodLabel} · BDT`}
          icon={Wallet}
          className="xl:col-span-3"
          isLoading={chartsFetching}
          isError={chartsError}
          isEmpty={!charts?.revenueOverTime?.length}
        >
          <RevenueChart data={charts?.revenueOverTime ?? []} range={range} />
        </ChartCard>

        <ChartCard
          title="New users"
          description={periodLabel}
          icon={UserPlus}
          className="xl:col-span-2"
          isLoading={chartsFetching}
          isError={chartsError}
          isEmpty={!charts?.usersOverTime?.length}
        >
          <TrendAreaChart
            data={charts?.usersOverTime ?? []}
            range={range}
            label="Signups"
            colorVar="var(--chart-3)"
          />
        </ChartCard>
      </section>

      <ChartCard
        title="What people are filing"
        description={`${periodLabel} · top 10`}
        icon={Layers}
        isLoading={chartsFetching}
        isError={chartsError}
      >
        <Tabs defaultValue="income">
          <TabsList>
            <TabsTrigger value="income">Income sources</TabsTrigger>
            <TabsTrigger value="tax-types">Tax types</TabsTrigger>
          </TabsList>
          <TabsContent value="income" className="pt-4">
            {charts?.incomeSourceMix?.length ? (
              <CategoryBarChart
                data={charts.incomeSourceMix}
                measureLabel="Orders"
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No income sources recorded for this period.
              </p>
            )}
          </TabsContent>
          <TabsContent value="tax-types" className="pt-4">
            {charts?.taxTypeMix?.length ? (
              <CategoryBarChart
                data={charts.taxTypeMix}
                measureLabel="Orders"
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No tax types recorded for this period.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </ChartCard>

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
                    {humanizeStatus(order.status ?? "")}
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
