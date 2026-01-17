"use client";

import { useGetUsersQuery, useUpdateUserMutation } from "@/redux/api/user/userApi";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const users = data?.data || [];

  const filteredUsers = users.filter((user: any) => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await updateUser({ mobile: user.mobile, data: { status: newStatus } }).unwrap();
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              View and manage all registered users in the system.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.mobile}>
                    <TableCell className="font-medium text-nowrap">{user.name}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "active" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {user.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toast.info("Edit feature coming soon")}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleStatus(user)}
                            className={user.status === 'blocked' ? 'text-green-600' : 'text-red-600'}
                          >
                            {user.status === "blocked" ? (
                              <><UserCheck className="mr-2 h-4 w-4" /> Unblock User</>
                            ) : (
                              <><UserX className="mr-2 h-4 w-4" /> Block User</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
