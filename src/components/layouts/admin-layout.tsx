"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  Files, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  ChevronRight,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLogoutMutation } from "@/redux/api/auth/authApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Tax Orders", href: "/admin/orders", icon: FileText },
  { name: "Tax Types", href: "/admin/tax-types", icon: Calculator },
  { name: "Files", href: "/admin/files", icon: Files },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          !isSidebarOpen && "-translate-x-full md:hidden"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
              <Calculator className="h-6 w-6 text-primary" />
              <span>Smart Tax <span className="text-primary">Admin</span></span>
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

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className={cn("md:hidden", isSidebarOpen && "hidden")}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Super Admin</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
