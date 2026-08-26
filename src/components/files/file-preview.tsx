"use client";

import { File as FileIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type FileKind = "image" | "pdf" | "other";

/** Derives the renderable kind from the stored Cloudinary URL. */
export const getFileKind = (url?: string): FileKind => {
  if (!url) return "other";
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)) return "image";
  if (/\.pdf$/i.test(url)) return "pdf";
  return "other";
};

/**
 * Asks Cloudinary for a downscaled copy instead of shipping the full-size
 * original into a 64px box. Non-Cloudinary URLs are returned untouched.
 */
const thumbUrl = (url: string, width: number) =>
  url.includes("/upload/")
    ? url.replace("/upload/", `/upload/c_fill,w_${width},h_${width},q_auto/`)
    : url;

interface FilePreviewProps {
  /** The stored file URL (`Ifile.file`). */
  file: string;
  /** Alt text / fallback label — usually `Ifile.name`. */
  name: string;
  /** `thumb` for list rows, `full` for a dedicated preview pane. */
  size?: "thumb" | "full";
  className?: string;
}

/**
 * Query-free renderer for an uploaded file, shared by the file details page and
 * the order's required-documents rows so the type sniffing lives in one place.
 */
const FilePreview = ({
  file,
  name,
  size = "thumb",
  className,
}: FilePreviewProps) => {
  const kind = getFileKind(file);

  if (size === "thumb") {
    return (
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/40",
          className,
        )}
      >
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl(file, 112)}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : kind === "pdf" ? (
          <div className="flex flex-col items-center gap-0.5 text-primary">
            <FileText className="h-6 w-6" />
            <span className="text-[9px] font-black tracking-tight">PDF</span>
          </div>
        ) : (
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file}
          alt={name}
          className="max-h-[600px] w-auto rounded-lg object-contain shadow-md"
        />
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <iframe
        src={`${file}#toolbar=0`}
        className={cn("h-[600px] w-full rounded-lg border shadow-sm", className)}
        title={name}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 text-muted-foreground",
        className,
      )}
    >
      <FileIcon className="h-24 w-24" />
      <p className="text-xl font-semibold">{name}</p>
      <p>Preview not available for this file type</p>
    </div>
  );
};

export default FilePreview;
