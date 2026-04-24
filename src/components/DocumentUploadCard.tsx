"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Camera,
  FolderOpen,
  Check,
  X,
  RefreshCw,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export type DocumentStatus =
  | "empty"
  | "uploading"
  | "uploaded"
  | "verified"
  | "rejected";

interface DocumentUploadCardProps {
  title: string;
  description?: string;
  required?: boolean;
  status: DocumentStatus;
  uploadProgress?: number;
  previewUrl?: string;
  fileName?: string;
  fileSize?: number;
  rejectionReason?: string;
  onUpload: (file: File) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUploadCard({
  title,
  description,
  required = false,
  status,
  uploadProgress = 0,
  previewUrl,
  fileName,
  fileSize,
  rejectionReason,
  onUpload,
}: DocumentUploadCardProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState("");

  function handleFileSelected(file: File) {
    setSizeError("");
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSizeError("File size must be 5MB or less.");
      return;
    }
    onUpload(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  const isImage =
    previewUrl &&
    (fileName?.match(/\.(jpg|jpeg|png)$/i) || previewUrl.startsWith("data:image"));

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {required && <span className="text-sm text-destructive">*</span>}
        {status === "verified" && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            <Check className="size-3" strokeWidth={2.5} />
            Verified
          </span>
        )}
        {status === "rejected" && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            <X className="size-3" strokeWidth={2.5} />
            Rejected
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {/* Card body */}
      <div
        className={cn(
          "min-h-[120px] w-full rounded-xl border-2 transition-all duration-200",
          status === "empty" && "border-dashed border-border bg-muted",
          status === "uploading" && "border-dashed border-primary/40 bg-[#EDEDFB]",
          status === "uploaded" && "border-border bg-white",
          status === "verified" && "border-green-200 bg-green-50",
          status === "rejected" && "border-red-200 bg-red-50"
        )}
      >
        {/* Empty state */}
        {status === "empty" && (
          <div className="flex flex-col items-center justify-center gap-3 p-5 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-white text-muted-foreground">
              <Upload className="size-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              Upload {title}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <Camera className="size-4" />
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <FolderOpen className="size-4" />
                Choose File
              </button>
            </div>
          </div>
        )}

        {/* Uploading state */}
        {status === "uploading" && (
          <div className="flex flex-col items-center justify-center gap-3 p-5">
            <p className="text-sm font-medium text-primary">Uploading...</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Upload progress: ${uploadProgress}%`}
              />
            </div>
            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
        )}

        {/* Uploaded / Verified / Rejected states */}
        {(status === "uploaded" || status === "verified" || status === "rejected") && (
          <div className="flex items-start gap-3 p-4">
            {/* Preview thumbnail */}
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {isImage && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={`Preview of ${title}`}
                  className="size-full object-cover"
                />
              ) : (
                <FileText className="size-8 text-muted-foreground" />
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {fileName ?? title}
              </p>
              {fileSize !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(fileSize)}
                </p>
              )}
              {status === "rejected" && rejectionReason && (
                <p className="mt-1 text-xs text-destructive">{rejectionReason}</p>
              )}
            </div>

            {/* Replace button */}
            {(status === "uploaded" || status === "rejected") && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
                aria-label={`Replace ${title}`}
              >
                <RefreshCw className="size-3.5" />
                Replace
              </button>
            )}
          </div>
        )}
      </div>

      {sizeError && (
        <p className="text-sm text-destructive" role="alert">
          {sizeError}
        </p>
      )}
    </div>
  );
}
