"use client";

import { useState } from "react";
import {
  useGetAllFilesQuery,
  useDeleteFileMutation,
  Ifile,
} from "@/redux/api/file/fileApi";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, Trash2, Files, CalendarClock, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { Column, DataTable } from "@/components/ui/data-table";

const FilesPage = () => {
  const { data, isLoading } = useGetAllFilesQuery();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const files = data?.data || [];

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
              <Files className="h-4 w-4" /> Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{files.length}</span>
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
              {files[0]?.name || "No uploads yet"}
            </span>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-primary/5 py-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={files}
            columns={columns}
            isLoading={isLoading}
            loadingMessage="Fetching documents..."
            emptyMessage="No tax documents found."
            rowKey={(file) => file._id!}
          />
        </CardContent>
      </Card>

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

export default FilesPage;
