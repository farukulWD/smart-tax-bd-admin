"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileIcon,
  Files,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  Ifile,
  useDeleteFileMutation,
  useGetAllFilesQuery,
} from "@/redux/api/file/fileApi";
import { useGetUsersQuery } from "@/redux/api/user/userApi";
import { useGetAllTaxOrdersQuery } from "@/redux/api/order/orderApi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Column, DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

const PAGE_LIMIT = 10;

const FilesClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const orderId = searchParams.get("orderId") ?? "";

  const setParams = useCallback(
    (
      patch: Record<string, string | number | null>,
      { replace = false }: { replace?: boolean } = {},
    ) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      });
      // Any filter change resets to the first page.
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      // Discrete choices push so Back undoes them; debounced typing replaces
      // so each keystroke does not become a history entry.
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== search) {
        setParams({ search: trimmed || null }, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, setParams]);

  // Keep the input in sync when the URL changes from the outside (back/forward).
  const [lastUrlSearch, setLastUrlSearch] = useState(search);
  if (search !== lastUrlSearch) {
    setLastUrlSearch(search);
    setSearchInput(search);
  }

  const { data, isLoading, isFetching } = useGetAllFilesQuery({
    page,
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
    ...(userId ? { userId } : {}),
    ...(orderId ? { orderId } : {}),
  });

  const { data: usersData } = useGetUsersQuery();
  const { data: ordersData } = useGetAllTaxOrdersQuery();

  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const files = useMemo<Ifile[]>(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const userOptions = useMemo<ComboboxOption[]>(
    () =>
      (usersData?.data ?? []).map((user) => ({
        value: user._id,
        label: user.mobile ? `${user.name} — ${user.mobile}` : user.name,
      })),
    [usersData],
  );

  const orderOptions = useMemo<ComboboxOption[]>(
    () =>
      (ordersData?.data ?? [])
        .filter((order) => Boolean(order._id))
        .map((order) => ({
          value: order._id!,
          label: `${order.personal_information?.name ?? "Unknown"} — ${
            order.tax_year ?? ""
          } · #${order._id!.slice(-6)}`,
        })),
    [ordersData],
  );

  const selectedUserLabel = userOptions.find((o) => o.value === userId)?.label;
  const selectedOrderLabel = orderOptions.find(
    (o) => o.value === orderId,
  )?.label;
  const hasFilters = Boolean(search || userId || orderId);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFile(deleteId).unwrap();
      toast.success("File deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const columns: Column<Ifile>[] = [
    {
      header: "File Name",
      cell: (file) => (
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-primary" />
          <span className="max-w-[220px] truncate font-medium">
            {file.name}
          </span>
        </div>
      ),
    },
    {
      header: "Type",
      className:
        "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      cell: (file) => file.type || "file",
    },
    {
      header: "User",
      cell: (file) =>
        file.user ? (
          <div className="max-w-[180px]">
            <span className="block truncate font-medium">{file.user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {file.user.mobile}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: "Order",
      className: "hidden lg:table-cell",
      cell: (file) =>
        file.orderId ? (
          <Link
            href={`/admin/orders/${file.orderId}`}
            className="block max-w-[200px] truncate text-sm text-primary hover:underline"
          >
            {file.order?.personal_information?.name ?? "—"}
            {file.order?.tax_year ? ` · ${file.order.tax_year}` : ""}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: "Uploaded At",
      className: "hidden md:table-cell",
      cell: (file) => (
        <span className="text-muted-foreground">
          {file.createdAt ? format(new Date(file.createdAt), "PPP") : "Unknown"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (file) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/files/${file._id}`}>
              <Eye className="h-4 w-4 text-primary" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteId(file._id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <section className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">File Management</h2>
        <p className="text-sm text-muted-foreground">
          Review and maintain all user-uploaded tax documents.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <Files className="h-4 w-4" />
              {hasFilters ? "Matching Files" : "Total Files"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{meta?.total ?? 0}</span>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Latest Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="max-w-full truncate text-lg font-semibold block">
              {page === 1 ? files[0]?.name || "No uploads yet" : "—"}
            </span>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="flex flex-col gap-3 border-b bg-primary/5 py-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Uploaded Files
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search file name or type..."
                className="w-full pl-8 sm:w-64"
              />
            </div>
            <Combobox
              options={userOptions}
              value={userId}
              onChange={(value) => setParams({ userId: value || null })}
              placeholder="All users"
              searchPlaceholder="Search user..."
              emptyText="No user found."
              clearLabel="All users"
              className="w-full sm:w-52"
            />
            <Combobox
              options={orderOptions}
              value={orderId}
              onChange={(value) => setParams({ orderId: value || null })}
              placeholder="All orders"
              searchPlaceholder="Search order..."
              emptyText="No order found."
              clearLabel="All orders"
              className="w-full sm:w-52"
            />
          </div>
        </CardHeader>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-6 py-2">
            {search && (
              <Badge variant="secondary" className="gap-1 font-normal">
                Search: {search}
                <button
                  type="button"
                  aria-label="Clear search filter"
                  onClick={() => setParams({ search: null })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {userId && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <span className="max-w-[200px] truncate">
                  User: {selectedUserLabel ?? userId}
                </span>
                <button
                  type="button"
                  aria-label="Clear user filter"
                  onClick={() => setParams({ userId: null })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {orderId && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <span className="max-w-[220px] truncate">
                  Order: {selectedOrderLabel ?? orderId}
                </span>
                <button
                  type="button"
                  aria-label="Clear order filter"
                  onClick={() => setParams({ orderId: null })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setSearchInput("");
                setParams({ search: null, userId: null, orderId: null });
              }}
            >
              Clear all
            </Button>
          </div>
        )}

        <CardContent className="p-0">
          <DataTable
            data={files}
            columns={columns}
            isLoading={isLoading || isFetching}
            loadingMessage="Fetching documents..."
            emptyMessage="No tax documents found."
            rowKey={(file) => file._id!}
          />
        </CardContent>
      </Card>

      {totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta?.page ?? page} of {totalPage} · {meta?.total ?? 0} files
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setParams({ page: page - 1 })}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPage}
              onClick={() => setParams({ page: page + 1 })}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        title="Delete file"
        description="This file will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default FilesClient;
