"use client";

import {
  useGetAllNewsAdminQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  INews,
} from "@/redux/api/news/newsApi";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit, Newspaper, ImageIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function NewsPage() {
  const { data, isLoading } = useGetAllNewsAdminQuery();
  const [createNews, { isLoading: isPendingCreate }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isPending }] = useUpdateNewsMutation();
  const [deleteNews] = useDeleteNewsMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<INews | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const newsList = useMemo<INews[]>(() => data?.data ?? [], [data]);

  const handleOpenModal = (item: INews | null = null) => {
    setEditingNews(item);
    setFormData(
      item
        ? {
            title: item.title ?? "",
            description: item.description ?? "",
            isActive: Boolean(item.isActive),
          }
        : { title: "", description: "", isActive: true },
    );
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    const payload = {
      title: formData.title,
      description: formData.description,
      isActive: formData.isActive,
    };
    fd.append("data", JSON.stringify(payload));
    if (attachmentFile) {
      fd.append("attachment", attachmentFile);
    }

    try {
      if (editingNews) {
        await updateNews({ id: editingNews._id, data: fd }).unwrap();
        toast.success("News updated successfully");
      } else {
        await createNews(fd).unwrap();
        toast.success("News created successfully");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this news item?")) {
      try {
        await deleteNews(id).unwrap();
        toast.success("News deleted successfully");
      } catch {
        toast.error("Failed to delete news");
      }
    }
  };

  const columns: Column<INews>[] = [
    {
      header: "Title",
      cell: (item) => (
        <span className="max-w-[180px] truncate font-medium block">
          {item.title}
        </span>
      ),
    },
    {
      header: "Description",
      cell: (item) => (
        <span className="max-w-sm truncate text-muted-foreground block">
          {item.description}
        </span>
      ),
    },
    {
      header: "Attachment",
      cell: (item) =>
        item.attachment ? (
          <a
            href={item.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            View
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={item.isActive ? "default" : "outline"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      header: <span className="flex justify-end">Actions</span>,
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenModal(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleDelete(item._id)}
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
          <h2 className="text-2xl font-bold tracking-tight">News & Updates</h2>
          <p className="text-sm text-muted-foreground">
            Manage news articles and updates shown to clients.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add News
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? "Edit News" : "Add News"}
                </DialogTitle>
                <DialogDescription>
                  Provide title, description, and optional attachment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Tax filing deadline extended"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Write the full news content here..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="attachment">Attachment (optional)</Label>
                  <Input
                    id="attachment"
                    type="file"
                    accept="image/*,.pdf"
                    ref={fileInputRef}
                    onChange={(e) =>
                      setAttachmentFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {editingNews?.attachment && !attachmentFile && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImageIcon className="h-3 w-3" />
                      Existing attachment will be kept unless replaced.
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={isPending || isPendingCreate} type="submit">
                  {editingNews ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{newsList.length}</span>
            <Newspaper className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {newsList.filter((n) => n.isActive).length}
            </span>
            <Newspaper className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">All News</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={newsList}
            columns={columns}
            isLoading={isLoading}
            loadingMessage="Loading news..."
            emptyMessage="No news articles found."
            rowKey={(item) => item._id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
