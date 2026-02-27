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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, Trash2, ExternalLink, Files, CalendarClock } from "lucide-react";
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
      } catch {
        toast.error("Failed to delete file");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">File Management</h2>
          <p className="text-sm text-muted-foreground">Review and maintain all user-uploaded tax documents.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Files</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-2xl font-bold">{files.length}</span>
              <Files className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Latest Upload</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="max-w-[80%] truncate text-sm font-medium">
                {files[0]?.name || "No uploads yet"}
              </span>
              <CalendarClock className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Uploaded At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Loading files...
                      </TableCell>
                    </TableRow>
                  ) : files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                        No files found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file: any) => (
                      <TableRow key={file._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4 text-primary" />
                            <span className="max-w-[220px] truncate">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {file.mimetype?.split("/")[1] || "file"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {file.createdAt ? format(new Date(file.createdAt), "PPP") : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label="Open file">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(file._id)}
                            >
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
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
