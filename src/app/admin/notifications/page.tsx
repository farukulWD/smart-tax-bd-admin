"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  INotification,
  TNotificationType,
  useDeleteNotificationMutation,
  useGetAllNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/redux/api/notifications/notificationApi";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<TNotificationType, string> = {
  USER_REGISTERED: "User Registered",
  PASSWORD_CHANGED: "Password Changed",
  PASSWORD_RESET: "Password Reset",
  TAX_ORDER_CREATED: "Order Created",
  TAX_ORDER_UPDATED: "Order Updated",
  DOCUMENTS_UPLOADED: "Docs Uploaded",
  TAX_ORDER_PLACED: "Order Placed",
  TAX_AMOUNTS_UPDATED: "Amounts Updated",
  PAYMENT_INITIATED: "Payment Initiated",
  PAYMENT_SUCCESS: "Payment Success",
  PAYMENT_FAILED: "Payment Failed",
  PAYMENT_CANCELLED: "Payment Cancelled",
  FILE_UPLOADED: "File Uploaded",
  FILE_DELETED: "File Deleted",
  NEWS_PUBLISHED: "News Published",
  NEWS_UPDATED: "News Updated",
};

const TYPE_COLORS: Record<TNotificationType, string> = {
  USER_REGISTERED: "bg-blue-100 text-blue-700",
  PASSWORD_CHANGED: "bg-yellow-100 text-yellow-700",
  PASSWORD_RESET: "bg-yellow-100 text-yellow-700",
  TAX_ORDER_CREATED: "bg-purple-100 text-purple-700",
  TAX_ORDER_UPDATED: "bg-purple-100 text-purple-700",
  DOCUMENTS_UPLOADED: "bg-indigo-100 text-indigo-700",
  TAX_ORDER_PLACED: "bg-green-100 text-green-700",
  TAX_AMOUNTS_UPDATED: "bg-orange-100 text-orange-700",
  PAYMENT_INITIATED: "bg-cyan-100 text-cyan-700",
  PAYMENT_SUCCESS: "bg-green-100 text-green-700",
  PAYMENT_FAILED: "bg-red-100 text-red-700",
  PAYMENT_CANCELLED: "bg-gray-100 text-gray-700",
  FILE_UPLOADED: "bg-teal-100 text-teal-700",
  FILE_DELETED: "bg-red-100 text-red-700",
  NEWS_PUBLISHED: "bg-pink-100 text-pink-700",
  NEWS_UPDATED: "bg-pink-100 text-pink-700",
};

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetAllNotificationsQuery({});
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const allNotifications = useMemo<INotification[]>(
    () => data?.data ?? [],
    [data],
  );

  const filtered = useMemo(() => {
    return allNotifications.filter((n) => {
      const matchType = typeFilter === "all" || n.type === typeFilter;
      const matchRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.isRead) ||
        (readFilter === "read" && n.isRead);
      return matchType && matchRead;
    });
  }, [allNotifications, typeFilter, readFilter]);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNotification(deleteId).unwrap();
      toast.success("Notification deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const columns: Column<INotification>[] = [
    {
      header: "Type",
      cell: (item) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            TYPE_COLORS[item.type],
          )}
        >
          {TYPE_LABELS[item.type] ?? item.type}
        </span>
      ),
    },
    {
      header: "Title",
      cell: (item) => (
        <span
          className={cn(
            "block max-w-[160px] truncate text-sm",
            !item.isRead && "font-semibold",
          )}
        >
          {item.title}
        </span>
      ),
    },
    {
      header: "Message",
      cell: (item) => (
        <span className="block max-w-xs truncate text-xs text-muted-foreground">
          {item.message}
        </span>
      ),
    },
    {
      header: "Recipient",
      cell: (item) =>
        item.isGlobal ? (
          <Badge variant="outline" className="text-xs">
            Broadcast
          </Badge>
        ) : item.recipientId ? (
          <span className="text-xs">{item.recipientId.name}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={item.isRead ? "outline" : "default"} className="text-xs">
          {item.isRead ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      header: "Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: <span className="flex justify-end">Actions</span>,
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          {!item.isRead && (
            <Button
              variant="ghost"
              size="icon"
              title="Mark as read"
              onClick={() => handleMarkAsRead(item._id)}
            >
              <CheckCheck className="h-4 w-4 text-primary" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            All system notifications across modules.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{allNotifications.length}</span>
            <Bell className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{unreadCount}</span>
            <Bell className="h-5 w-5 text-destructive" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Broadcast</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {allNotifications.filter((n) => n.isGlobal).length}
            </span>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="text-base">All Notifications</CardTitle>
          <div className="flex gap-2">
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filtered}
            columns={columns}
            isLoading={isLoading}
            loadingMessage="Loading notifications..."
            emptyMessage="No notifications found."
            rowKey={(item) => item._id}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        title="Delete notification"
        description="This notification will be permanently removed. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
