"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Ifile } from "@/redux/api/file/fileApi";
import { useAdminUploadDocumentForUserMutation } from "@/redux/api/order/orderApi";
import { globalErrorHandler } from "@/helpers/globalErrorHandler";
import FilePreview from "@/components/files/file-preview";
import { cn } from "@/lib/utils";

interface RequiredDocumentsSectionProps {
  orderId: string;
  /**
   * Resolved server-side from the admin-managed catalog. Never recompute it
   * here — the tax type / income source / file name mapping lives in the DB.
   */
  requiredDocuments: string[];
  /**
   * Every file stored against this order, newest first. Authoritative — comes
   * from the `files` collection, not the order's `documents` cache.
   */
  uploadedFiles: Ifile[];
  /** True when the client chose to upload documents later. */
  filesUploadPending?: boolean;
}

/** Upload slot + uploaded-file view for one document type. */
const DocumentRow = ({
  docType,
  files,
  orderId,
}: {
  docType: string;
  files: Ifile[];
  orderId: string;
}) => {
  const [adminUploadDocumentForUser] = useAdminUploadDocumentForUserMutation();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);

  const [current, ...olderVersions] = files;
  const isUploaded = Boolean(current);
  const showUploadControls = !isUploaded || replaceOpen;

  const handleUpload = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("type", docType);
      await adminUploadDocumentForUser({ taxId: orderId, formData }).unwrap();
      toast.success(`${docType} uploaded successfully`);
      setPendingFile(null);
      setReplaceOpen(false);
    } catch (error) {
      globalErrorHandler(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-3">
        {isUploaded ? (
          <FilePreview file={current.file} name={current.name} size="thumb" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            <FileText className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {docType}
          </p>
          {isUploaded ? (
            <Badge className="mt-1 border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Uploaded
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="mt-1 border-amber-300 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
            >
              Missing
            </Badge>
          )}
        </div>

        {isUploaded && (
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link href={`/admin/files/${current._id}`}>View</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1"
              onClick={() => {
                setReplaceOpen((open) => !open);
                setPendingFile(null);
              }}
            >
              {replaceOpen ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              {replaceOpen ? "Cancel" : "Replace"}
            </Button>
          </div>
        )}
      </div>

      {showUploadControls && (
        <div className={cn("flex items-center gap-2", isUploaded && "mt-3")}>
          <Input
            type="file"
            accept="image/*,application/pdf"
            className="h-8 flex-1 cursor-pointer text-xs file:cursor-pointer"
            onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            disabled={!pendingFile || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isUploaded ? (
              "Replace"
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      )}

      {olderVersions.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
            older versions ({olderVersions.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            {olderVersions.map((file) => (
              <Link
                key={file._id}
                href={`/admin/files/${file._id}`}
                className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{file.name}</span>
                {file.createdAt && (
                  <span className="ml-auto shrink-0 tabular-nums">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                )}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

/**
 * Always-visible documents panel for an order: every required document with its
 * uploaded file or an inline upload slot, plus anything uploaded outside the
 * required list. Rendered regardless of `files_upload_pending` — that flag only
 * changes the styling and the explanatory note.
 */
const RequiredDocumentsSection = ({
  orderId,
  requiredDocuments,
  uploadedFiles,
  filesUploadPending,
}: RequiredDocumentsSectionProps) => {
  // Newest file per type. `uploadedFiles` already arrives sorted createdAt desc.
  const filesByType = useMemo(() => {
    const map = new Map<string, Ifile[]>();
    for (const file of uploadedFiles) {
      map.set(file.type, [...(map.get(file.type) ?? []), file]);
    }
    return map;
  }, [uploadedFiles]);

  const otherDocs = useMemo(
    () => uploadedFiles.filter((file) => !requiredDocuments.includes(file.type)),
    [uploadedFiles, requiredDocuments],
  );

  const uploadedCount = requiredDocuments.filter((doc) =>
    filesByType.has(doc),
  ).length;

  if (requiredDocuments.length === 0 && uploadedFiles.length === 0) {
    return (
      <section>
        <h3 className="mb-5 flex items-center text-xl font-bold text-foreground">
          <FileText className="mr-3 h-5 w-5 text-primary" />
          Documents
        </h3>
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No documents are required for this order yet.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn(
        filesUploadPending &&
          "rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 dark:border-amber-500/40 dark:bg-amber-500/10",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3
          className={cn(
            "flex items-center text-xl font-bold text-foreground",
            filesUploadPending && "text-amber-700 dark:text-amber-400",
          )}
        >
          {filesUploadPending ? (
            <AlertTriangle className="mr-3 h-5 w-5" />
          ) : (
            <FileText className="mr-3 h-5 w-5 text-primary" />
          )}
          Required Documents
        </h3>
        {requiredDocuments.length > 0 && (
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {uploadedCount}/{requiredDocuments.length} uploaded
          </Badge>
        )}
      </div>

      {filesUploadPending && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-300/80">
          Client chose to upload files later. Upload the missing documents below
          on their behalf.
        </p>
      )}

      <div className="space-y-2">
        {requiredDocuments.map((doc) => (
          <DocumentRow
            key={doc}
            docType={doc}
            files={filesByType.get(doc) ?? []}
            orderId={orderId}
          />
        ))}
      </div>

      {otherDocs.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-muted-foreground">
            Other Documents
          </h4>
          <div className="flex flex-wrap gap-4">
            {otherDocs.map((file) => (
              <Link
                href={`/admin/files/${file._id}`}
                key={file._id}
                className="group flex w-37.5 flex-col items-center gap-3 rounded-2xl border bg-background p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl active:scale-95"
              >
                <FilePreview
                  file={file.file}
                  name={file.name}
                  size="thumb"
                  className="h-20 w-20"
                />
                <p className="block w-full truncate text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  {file.type}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RequiredDocumentsSection;
