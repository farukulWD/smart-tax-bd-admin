"use client";

import {
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/redux/api/user/userApi";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Edit,
  MoreHorizontal,
  UserCheck,
  UserX,
  UsersRound,
  ShieldAlert,
  UserSearch,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const users = useMemo(() => data?.data ?? [], [data]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user: any) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mobile?.includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [users, searchTerm],
  );

  const blockedUsersCount = users.filter(
    (user: any) => user.status === "blocked",
  ).length;

  const toggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await updateUser({
        mobile: user.mobile,
        data: { status: newStatus },
      }).unwrap();
      toast.success(
        `User ${newStatus === "active" ? "activated" : "blocked"} successfully`,
      );
    } catch {
      toast.error("Failed to update user status");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">
            View accounts, track roles, and control user access from one place.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, or email"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{users.length}</span>
            <UsersRound className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Blocked Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{blockedUsersCount}</span>
            <ShieldAlert className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{filteredUsers.length}</span>
            <UserSearch className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Registered Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No users found for the current search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.mobile}>
                      <TableCell className="font-medium text-nowrap">
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell>{user.mobile}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active" || !user.status
                              ? "default"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {user.status || "active"}
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
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info("Edit feature coming soon")
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleStatus(user)}
                              className={
                                user.status === "blocked"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }
                            >
                              {user.status === "blocked" ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" /> Unblock
                                  User
                                </>
                              ) : (
                                <>
                                  <UserX className="mr-2 h-4 w-4" /> Block User
                                </>
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
        </CardContent>
      </Card>
    </div>
  );
}
