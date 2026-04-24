"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoAssessmentData {
  score: number;
  isValid: boolean;
  damageDetected: boolean;
  notes: string;
}

interface VehiclePhotoAssessmentProps {
  photoUrl: string;
  photoType: string;
  assessment: PhotoAssessmentData;
  onRetake?: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const label =
    score >= 8 ? "Excellent" : score >= 6 ? "Acceptable" : "Poor";
  const colorClass =
    score >= 8
      ? "bg-green-50 text-green-700 border-green-200"
      : score >= 6
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        colorClass
      )}
    >
      {score}/10 — {label}
    </span>
  );
}

function formatPhotoType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function VehiclePhotoAssessment({
  photoUrl,
  photoType,
  assessment,
  onRetake,
}: VehiclePhotoAssessmentProps) {
  const showRetake = assessment.score < 7 || !assessment.isValid;

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Photo thumbnail */}
      <div className="relative h-[200px] w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={`${formatPhotoType(photoType)} assessment`}
          className="h-full w-full object-cover"
        />
        {/* Score overlay */}
        <div className="absolute top-2 right-2">
          <ScoreBadge score={assessment.score} />
        </div>
      </div>

      {/* Assessment details */}
      <div className="flex flex-col gap-2 p-3">
        {/* Damage alert */}
        {assessment.damageDetected && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
            <span>{assessment.notes}</span>
          </div>
        )}

        {/* Invalid photo alert */}
        {!assessment.isValid && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
            <span>
              This does not look like a {formatPhotoType(photoType).toLowerCase()} photo. Please retake.
            </span>
          </div>
        )}

        {/* Notes (only if valid and no damage) */}
        {assessment.isValid && !assessment.damageDetected && assessment.notes && (
          <p className="text-xs text-muted-foreground">{assessment.notes}</p>
        )}

        {/* Retake button */}
        {showRetake && onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <RefreshCw className="size-4" />
            Retake Photo
          </button>
        )}
      </div>
    </div>
  );
}
