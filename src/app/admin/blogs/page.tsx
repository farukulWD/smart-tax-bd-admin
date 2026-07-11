"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IBlog,
  useDeleteBlogMutation,
  useGetAllBlogsAdminQuery,
} from "@/redux/api/blog/blogApi";

const PAGE_LIMIT = 10;

export default function BlogsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetAllBlogsAdminQuery({
    page,
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
    ...(status !== "all" ? { status } : {}),
  });

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const blogs = useMemo<IBlog[]>(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBlog(deleteId).unwrap();
      toast.success("Blog deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const columns: Column<IBlog>[] = [
    {
      header: "Cover",
      cell: (item) =>
        item.coverImage ? (
          <div className="relative h-10 w-16 overflow-hidden rounded-md border border-border">
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-16 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
            <BookOpen className="h-4 w-4" />
          </div>
        ),
    },
    {
      header: "Title",
      cell: (item) => (
        <div className="max-w-[240px]">
          <span className="block truncate font-medium">{item.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            /{item.slug}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (item) => (
        <Badge variant="secondary" className="font-normal">
          {item.category}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={item.status === "published" ? "default" : "outline"}>
          {item.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Views",
      cell: (item) => (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {item.views}
        </span>
      ),
    },
    {
      header: "Published",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      header: <span className="flex justify-end">Actions</span>,
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/blogs/${item._id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
          <h2 className="text-2xl font-bold tracking-tight">Blogs</h2>
          <p className="text-sm text-muted-foreground">
            Write and manage blog posts shown on the public site.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/create">
            <Plus className="mr-2 h-4 w-4" /> New Blog
          </Link>
        </Button>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Blog Posts</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title or tags..."
                className="w-full pl-8 sm:w-64"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={blogs}
            columns={columns}
            isLoading={isLoading || isFetching}
            loadingMessage="Loading blogs..."
            emptyMessage="No blog posts found."
            rowKey={(item) => item._id}
          />
        </CardContent>
      </Card>

      {totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta?.page ?? page} of {totalPage} · {meta?.total ?? 0} posts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPage}
              onClick={() => setPage((p) => p + 1)}
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
        title="Delete blog post"
        description="This blog post will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
