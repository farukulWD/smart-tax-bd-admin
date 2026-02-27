import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, UserCog } from "lucide-react";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">Configure admin preferences, account security, and notification behavior.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCog className="h-4 w-4 text-primary" />
                Account Preferences
              </CardTitle>
              <CardDescription>Update your profile and default dashboard behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Manage password policy and admin session settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Choose how and when alerts are sent to admins.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
}
