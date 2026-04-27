"use client";

import { useRef, useState } from "react";
import { Camera, RefreshCw, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export interface PhotoMetadata {
  timestamp: string;
  lat: number | null;
  lng: number | null;
}

interface VehiclePhotoCaptureProps {
  photoType: string;
  label: string;
  onCapture: (file: File, metadata: PhotoMetadata) => void;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function VehiclePhotoCapture({
  photoType,
  label,
  onCapture,
}: VehiclePhotoCaptureProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    const ts = formatTimestamp(now);
    setTimestamp(ts);
    setCapturedFile(file);
    setConfirmed(false);

    const url = URL.createObjectURL(file);
    setPreview(url);

    e.target.value = "";
  }

  function handleRetake() {
    setPreview(null);
    setCapturedFile(null);
    setTimestamp("");
    setConfirmed(false);
    inputRef.current?.click();
  }

  function handleUsePhoto() {
    if (!capturedFile) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onCapture(capturedFile, {
            timestamp,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          onCapture(capturedFile, { timestamp, lat: null, lng: null });
        },
        { timeout: 5000 }
      );
    } else {
      onCapture(capturedFile, { timestamp, lat: null, lng: null });
    }

    setConfirmed(true);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <p className="text-sm font-medium text-foreground">{label}</p>

      {/* Hidden input — uses camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted min-h-[140px] transition-all duration-200">
        {!preview ? (
          /* Empty / take photo state */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all duration-200 hover:bg-muted/80"
            aria-label={`Take photo: ${label}`}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-white text-muted-foreground">
              <Camera className="size-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t("takePhoto")}</p>
            <p className="text-xs text-muted-foreground">{photoType}</p>
          </button>
        ) : confirmed ? (
          /* Confirmed state */
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`${label} photo`}
              className="h-36 w-full object-cover"
            />
            {/* Timestamp watermark */}
            <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {timestamp}
            </div>
            {/* Confirmed badge */}
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
              <Check className="size-3" strokeWidth={2.5} />
              {t("saved")}
            </div>
            {/* Retake */}
            <button
              type="button"
              onClick={handleRetake}
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white transition-all duration-200 hover:bg-black/80 cursor-pointer focus:outline-none"
            >
              <RefreshCw className="size-3" />
              {t("retake")}
            </button>
          </div>
        ) : (
          /* Preview — pending confirmation */
          <div className="flex flex-col gap-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview of ${label}`}
                className="h-36 w-full object-cover"
              />
              {/* Timestamp watermark overlay */}
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {timestamp}
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-2 px-3 pb-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border bg-white text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-destructive hover:text-destructive cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <RefreshCw className="size-4" />
                {t("retake")}
              </button>
              <button
                type="button"
                onClick={handleUsePhoto}
                className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <Check className="size-4" />
                {t("useThisPhoto")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
