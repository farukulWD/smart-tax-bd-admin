"use client";

import { useGetSingleFileQuery } from "@/redux/api/file/fileApi";
import {
  Download,
  File as FileIcon,
  FileText,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Link from "next/link";

const FileDetails = ({ fileId }: { fileId: string }) => {
  const { data, isLoading, isError } = useGetSingleFileQuery(fileId);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-destructive">
        Error loading file details.
      </div>
    );
  }

  const fileData = data.data;
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileData.file);
  const isPdf = /\.pdf$/i.test(fileData.file);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left side: File Preview */}
      <Card className="lg:col-span-8 overflow-hidden bg-muted/30">
        <CardHeader className="border-b bg-card">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            File Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[500px] items-center justify-center p-4">
          {isImage ? (
            <div className="relative h-full w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileData.file}
                alt={fileData.name}
                className="max-h-[600px] w-auto rounded-lg object-contain shadow-md"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`${fileData.file}#toolbar=0`}
              className="h-[600px] w-full rounded-lg border shadow-sm"
              title={fileData.name}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <FileIcon className="h-24 w-24" />
              <p className="text-xl font-semibold">{fileData.name}</p>
              <p>Preview not available for this file type</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right side: File Details */}
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">File Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                File Name
              </p>
              <p className="font-semibold wrap-break-word">{fileData.name}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  File Type
                </p>
                <Badge variant="secondary" className="uppercase">
                  {fileData.type}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Uploaded On
                </p>
                <p className="text-sm">
                  {fileData.createdAt
                    ? format(new Date(fileData.createdAt), "PPP")
                    : "N/A"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Customer / User
              </p>
              <Link
                href={`/admin/users/${fileData.userId}`}
                className="text-primary hover:underline font-medium block"
              >
                {fileData.user?.name || "N/A"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {fileData.user?.email}
              </p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Associated Order
              </p>
              <Link
                href={`/admin/orders/${fileData.orderId}`}
                className="text-primary hover:underline font-medium block"
              >
                Order #{fileData.orderId.slice(-6).toUpperCase()}
              </Link>
              <p className="text-xs text-muted-foreground">
                Tax Year: {fileData.order?.tax_year || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                Payable: {fileData.order?.tax_payable_amount || 0} BDT
              </p>
            </div>

            <Button 
              className="w-full mt-6" 
              variant="default"
              onClick={async () => {
                try {
                  const response = await fetch(fileData.file);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = fileData.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error("Download failed:", error);
                  // Fallback to opening in new tab if blob fetch fails
                  window.open(fileData.file, "_blank");
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Download File
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions or Other Meta */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                {isImage ? (
                  <ImageIcon className="h-5 w-5 text-primary" />
                ) : (
                  <FileText className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold">Secure Storage</p>
                <p className="text-xs text-muted-foreground">
                  This file is stored securely and encrypted.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FileDetails;
