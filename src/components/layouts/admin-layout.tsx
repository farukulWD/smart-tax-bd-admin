"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  FileText,
  Files,
  Settings,
  UserCircle2,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Calculator,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetMeQuery, useLogoutMutation } from "@/redux/api/auth/authApi";
import { toast } from "sonner";
import Cookies from "js-cookie";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Tax Orders", href: "/admin/orders", icon: FileText },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Tax Types", href: "/admin/tax-types", icon: Calculator },
  { name: "Files", href: "/admin/files", icon: Files },
  { name: "Profile", href: "/admin/profile", icon: UserCircle2 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const params = useParams();

  const router = useRouter();
  const { data: meData } = useGetMeQuery();
  const [logoutApi] = useLogoutMutation();
  const currentUser = meData?.data;
  const userInitial =
    currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  const { baseTitle, fullTitle, baseHref } = useMemo(() => {
    const item =
      navItems.find((nav) => nav.href === pathname) ??
      navItems.find(
        (nav) => nav.href !== "/admin" && pathname.startsWith(nav.href),
      );

    const base = item?.name ?? "Admin";
    const href = item?.href ?? "/admin";
    let full = base;

    // Handle dynamic params if they exist
    const paramValues = Object.values(params || {});
    if (paramValues.length > 0) {
      const displayParams = paramValues
        .map((p) => (Array.isArray(p) ? p.join(" / ") : p))
        .filter((p) => p && p !== "undefined");

      if (displayParams.length > 0) {
        full = `Single ${base}`;
      }
    }

    return { baseTitle: base, fullTitle: full, baseHref: href };
  }, [pathname, params]);

  const isItemActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
      Cookies.remove("adminAccessToken");
      Cookies.remove("refreshToken");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="relative flex min-h-screen bg-muted/30 text-foreground">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0",
          !isSidebarOpen && "-translate-x-full md:translate-x-0 md:w-72",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <Link
              href="/admin"
              className="group flex items-center gap-2 font-semibold"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Calculator className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                Smart Tax
                <span className="block text-xs font-medium text-muted-foreground">
                  Admin Portal
                </span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-accent-foreground",
                    )}
                  />
                  <span>{item.name}</span>
                  {active && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-border p-4">
            <div className="rounded-lg border border-border bg-background px-3 py-2">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Secure admin session
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className={cn("md:hidden", isSidebarOpen && "hidden")}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link
                  href="/admin"
                  className="transition-colors hover:text-foreground hover:underline underline-offset-4"
                >
                  Admin
                </Link>
                {baseHref !== "/admin" && (
                  <>
                    <span>/</span>
                    <Link
                      href={baseHref}
                      className="transition-colors hover:text-foreground hover:underline underline-offset-4"
                    >
                      {baseTitle}
                    </Link>
                  </>
                )}
              </nav>
              <h1 className="text-sm font-semibold sm:text-base">
                {fullTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {currentUser?.name || "Admin User"}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {currentUser?.role || "Admin"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
              {userInitial}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
