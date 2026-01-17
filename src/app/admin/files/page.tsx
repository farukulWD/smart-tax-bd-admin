"use client";

import { useGetAllFilesQuery, useDeleteFileMutation } from "@/redux/api/file/fileApi";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileIcon, Trash2, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FilesPage() {
  const { data, isLoading } = useGetAllFilesQuery();
  const [deleteFile] = useDeleteFileMutation();
  const files = data?.data || [];

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        await deleteFile(id).unwrap();
        toast.success("File deleted successfully");
      } catch (error) {
        toast.error("Failed to delete file");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">File Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage all user-uploaded tax documents and files.
          </p>
        </div>

        <div className="rounded-md border bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading files...
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No files found.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file: any) => (
                  <TableRow key={file._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-zinc-500" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase text-xs font-bold text-zinc-500">
                      {file.mimetype?.split('/')[1] || 'FILE'}
                    </TableCell>
                    <TableCell>
                      {file.createdAt ? format(new Date(file.createdAt), "PPP") : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(file._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
