"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ExtractedDocumentData,
  VerificationResult,
} from "@/lib/ai/document-parser";

interface DocumentVerificationCardProps {
  extractedData: ExtractedDocumentData;
  verification: VerificationResult;
  onConfirm: () => void;
  onCorrect: (correctedFields: Record<string, string>) => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  pan_number: "PAN Number",
  dob: "Date of Birth",
  fathers_name: "Father's Name",
  aadhaar_number: "Aadhaar Number",
  address: "Address",
  gender: "Gender",
  dl_number: "DL Number",
  expiry: "Expiry Date",
  expiry_date: "Expiry Date",
  vehicle_classes: "Vehicle Classes",
  blood_group: "Blood Group",
  issue_date: "Issue Date",
  registration_number: "Registration No.",
  owner_name: "Owner Name",
  validity: "Valid Until",
  chassis_number: "Chassis No.",
  engine_number: "Engine No.",
  vehicle_class: "Vehicle Class",
  fuel_type: "Fuel Type",
  maker: "Manufacturer",
  policy_number: "Policy Number",
  insured_name: "Insured Name",
  vehicle_number: "Vehicle No.",
  insurer: "Insurer",
  coverage_type: "Coverage Type",
  certificate_number: "Certificate No.",
  emission_result: "Emission Result",
  verification_date: "Verification Date",
  station: "Police Station",
  result: "Result",
  doctor_name: "Doctor",
  hospital: "Hospital",
};

function getFieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    confidence >= 0.8
      ? "bg-green-500"
      : confidence >= 0.6
        ? "bg-amber-500"
        : "bg-red-500";
  const label =
    confidence >= 0.8
      ? "High confidence"
      : confidence >= 0.6
        ? "Medium confidence"
        : "Low confidence";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {pct}% {label}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: VerificationResult["status"] }) {
  if (status === "passed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        <Check className="size-3.5" strokeWidth={2.5} />
        Verified
      </span>
    );
  }
  if (status === "flagged") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <AlertTriangle className="size-3.5" strokeWidth={2.5} />
        Needs Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      <X className="size-3.5" strokeWidth={2.5} />
      Rejected
    </span>
  );
}

export default function DocumentVerificationCard({
  extractedData,
  verification,
  onConfirm,
  onCorrect,
}: DocumentVerificationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>(
    () => ({ ...extractedData.fields })
  );
  const [showChecks, setShowChecks] = useState(false);

  function handleFieldChange(key: string, value: string) {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveCorrections() {
    onCorrect(editedFields);
    setIsEditing(false);
  }

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 transition-all duration-200",
        verification.status === "passed" && "border-green-200 bg-green-50/50",
        verification.status === "flagged" && "border-amber-200 bg-amber-50/50",
        verification.status === "rejected" && "border-red-200 bg-red-50/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">
          We found:
        </p>
        <StatusBadge status={verification.status} />
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <ConfidenceBar confidence={extractedData.confidence} />
      </div>

      {/* Extracted fields */}
      <div className="flex flex-col gap-1.5 mb-3">
        {Object.entries(isEditing ? editedFields : extractedData.fields).map(
          ([key, value]) => (
            <div
              key={key}
              className="flex items-start justify-between gap-2 py-1.5 border-b border-border/50 last:border-0"
            >
              <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                {getFieldLabel(key)}
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="min-w-0 flex-1 text-right rounded-lg border border-input bg-white px-2 py-1 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring/30"
                />
              ) : (
                <span className="text-sm font-medium text-foreground text-right">
                  {value}
                </span>
              )}
            </div>
          )
        )}
      </div>

      {/* Verification checks — collapsible */}
      {verification.checks.length > 0 && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowChecks((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showChecks ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {verification.checks.length} verification check
            {verification.checks.length !== 1 ? "s" : ""}
          </button>

          {showChecks && (
            <div className="mt-2 flex flex-col gap-1.5">
              {verification.checks.map((check) => (
                <div key={check.check} className="flex items-start gap-2">
                  {check.passed ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" strokeWidth={2.5} />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-red-600" strokeWidth={2.5} />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {check.check}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {check.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification notes */}
      {verification.notes && verification.status !== "passed" && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 mb-3 text-xs",
            verification.status === "flagged" && "bg-amber-100 text-amber-800",
            verification.status === "rejected" && "bg-red-100 text-red-800"
          )}
        >
          {verification.notes}
        </div>
      )}

      {/* Action buttons */}
      {isEditing ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditedFields({ ...extractedData.fields });
              setIsEditing(false);
            }}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveCorrections}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            Save Corrections
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            No, let me fix
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            Yes, this is correct
          </button>
        </div>
      )}
    </div>
  );
}
