import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calculator, Files } from "lucide-react";

const stats = [
  { name: "Total Users", value: "1,234", icon: Users, color: "text-blue-500" },
  { name: "Pending Orders", value: "56", icon: FileText, color: "text-amber-500" },
  { name: "Tax Types", value: "12", icon: Calculator, color: "text-green-500" },
  { name: "Documents", value: "890", icon: Files, color: "text-purple-500" },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome to the Smart Tax BD admin panel. Here&apos;s what&apos;s happening today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-zinc-500 italic">
                Recent orders list will appear here
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[200px] flex items-center justify-center text-zinc-500 italic">
                Quick actions will appear here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
