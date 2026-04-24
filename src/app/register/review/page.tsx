"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  FileText,
  Car,
  Users,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Send,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import { cn } from "@/lib/utils";

// ---- Mock data — in production read from global state / context ----

const MOCK_PROFILE = {
  businessName: "Sharma Travels",
  ownerName: "Rajesh Sharma",
  city: "Bangalore",
  isSelfDriver: false,
  fleetSize: "2-5 cars",
};

interface DocItem {
  label: string;
  uploaded: boolean;
  verificationStatus?: "passed" | "flagged" | "rejected" | "pending";
}

const MOCK_DOCS: DocItem[] = [
  { label: "PAN Card", uploaded: true, verificationStatus: "passed" },
  { label: "Aadhaar Card", uploaded: true, verificationStatus: "passed" },
  { label: "GST Certificate", uploaded: false, verificationStatus: "pending" },
  { label: "Bank Account Details", uploaded: true },
];

interface MockVehicle {
  regNumber: string;
  type: string;
  docCount: number;
  totalDocs: number;
  conditionScore: number | null;
}

const MOCK_VEHICLES: MockVehicle[] = [
  {
    regNumber: "KA-01-AB-1234",
    type: "Innova",
    docCount: 4,
    totalDocs: 5,
    conditionScore: 8.2,
  },
  {
    regNumber: "KA-01-CD-5678",
    type: "Sedan",
    docCount: 5,
    totalDocs: 5,
    conditionScore: 7.5,
  },
];

interface MockDriver {
  name: string;
  docCount: number;
  totalDocs: number;
}

const MOCK_DRIVERS: MockDriver[] = [
  { name: "Arun Kumar", docCount: 6, totalDocs: 7 },
];

// ---- Subcomponents ----

function SectionCard({
  icon,
  title,
  editHref,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-primary">{icon}</div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h2>
        </div>
        <Link
          href={editHref}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <Pencil className="size-3" />
          Edit
        </Link>
      </div>
      {children}
    </div>
  );
}

function VerificationBadge({
  status,
}: {
  status?: "passed" | "flagged" | "rejected" | "pending";
}) {
  if (!status || status === "pending") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <AlertCircle className="size-3.5" />
        Pending
      </span>
    );
  }
  if (status === "passed") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-700">
        <ShieldCheck className="size-3.5" />
        AI Verified
      </span>
    );
  }
  if (status === "flagged") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
        <ShieldAlert className="size-3.5" />
        Needs Review
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-600">
      <ShieldX className="size-3.5" />
      Rejected
    </span>
  );
}

function DocStatusRow({ label, uploaded, verificationStatus }: DocItem) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {uploaded ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle className="size-3.5" />
            Uploaded
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertCircle className="size-3.5" />
            Pending
          </span>
        )}
        {uploaded && verificationStatus && (
          <>
            <span className="text-border">|</span>
            <VerificationBadge status={verificationStatus} />
          </>
        )}
      </div>
    </div>
  );
}

// ---- Main component ----

export default function ReviewPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for any rejected documents
  const hasRejected = MOCK_DOCS.some(
    (d) => d.verificationStatus === "rejected"
  );
  const hasFlagged = MOCK_DOCS.some(
    (d) => d.verificationStatus === "flagged"
  );

  function handleSubmit() {
    if (hasRejected) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <ProgressStepper currentStep={5} completedSteps={[1, 2, 3, 4, 5]} />
        <div className="rounded-2xl bg-white p-8 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle
              className="size-10 text-green-600"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Application Submitted!
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-sm">
              Your vendor application is under review. We will contact you
              within 2-3 business days.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted px-6 py-4 text-sm text-muted-foreground text-left w-full max-w-sm">
            <p className="font-medium text-foreground mb-1">
              What happens next?
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>AaoCab team reviews your documents</li>
              <li>Background verification is done</li>
              <li>You receive onboarding call</li>
              <li>Account is activated</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={5} completedSteps={[1, 2, 3, 4]} />

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Review &amp; Submit
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Review your details before submitting for verification.
          </p>
        </div>

        {/* Warning banner for rejected/flagged documents */}
        {hasRejected && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3">
            <ShieldX className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Some documents have been rejected
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Please go back and re-upload the rejected documents before
                submitting your application.
              </p>
            </div>
          </div>
        )}
        {!hasRejected && hasFlagged && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Some documents need attention
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                You can still submit, but flagged documents may require
                additional review and delay your approval.
              </p>
            </div>
          </div>
        )}

        {/* Vendor Profile */}
        <SectionCard
          icon={<User className="size-5" />}
          title="Vendor Profile"
          editHref="/register/profile"
        >
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm py-1 border-b border-border">
              <span className="text-muted-foreground">Business Name</span>
              <span className="font-medium text-foreground">
                {MOCK_PROFILE.businessName}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-border">
              <span className="text-muted-foreground">Owner Name</span>
              <span className="font-medium text-foreground">
                {MOCK_PROFILE.ownerName}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-border">
              <span className="text-muted-foreground">City</span>
              <span className="font-medium text-foreground">
                {MOCK_PROFILE.city}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-border">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium text-foreground">
                {MOCK_PROFILE.isSelfDriver ? "Self Driver" : "Fleet Owner"}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">Fleet Size</span>
              <span className="font-medium text-foreground">
                {MOCK_PROFILE.fleetSize}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Documents */}
        <SectionCard
          icon={<FileText className="size-5" />}
          title="Business Documents"
          editHref="/register/documents"
        >
          <div className="flex flex-col">
            {MOCK_DOCS.map((doc) => (
              <DocStatusRow key={doc.label} {...doc} />
            ))}
          </div>
        </SectionCard>

        {/* Vehicles */}
        <SectionCard
          icon={<Car className="size-5" />}
          title="Vehicles"
          editHref="/register/vehicles"
        >
          <div className="flex flex-col gap-3">
            {MOCK_VEHICLES.map((v) => (
              <div
                key={v.regNumber}
                className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground font-mono">
                    {v.regNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">{v.type}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      v.docCount === v.totalDocs
                        ? "text-green-700"
                        : "text-amber-600"
                    )}
                  >
                    {v.docCount === v.totalDocs ? (
                      <CheckCircle className="size-3.5" />
                    ) : (
                      <AlertCircle className="size-3.5" />
                    )}
                    {v.docCount}/{v.totalDocs} docs
                  </div>
                  {v.conditionScore !== null && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        v.conditionScore >= 8
                          ? "text-green-700"
                          : v.conditionScore >= 6
                            ? "text-amber-600"
                            : "text-red-600"
                      )}
                    >
                      Condition: {v.conditionScore}/10
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Drivers */}
        {!MOCK_PROFILE.isSelfDriver && MOCK_DRIVERS.length > 0 && (
          <SectionCard
            icon={<Users className="size-5" />}
            title="Drivers"
            editHref="/register/drivers"
          >
            <div className="flex flex-col gap-3">
              {MOCK_DRIVERS.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {d.name}
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      d.docCount === d.totalDocs
                        ? "text-green-700"
                        : "text-amber-600"
                    )}
                  >
                    {d.docCount === d.totalDocs ? (
                      <CheckCircle className="size-3.5" />
                    ) : (
                      <AlertCircle className="size-3.5" />
                    )}
                    {d.docCount}/{d.totalDocs} docs
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Submit */}
        <div className="rounded-2xl bg-white p-6 shadow-sm flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            By submitting, you agree to the{" "}
            <Link
              href="/agreement"
              className="text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              AaoCab Vendor Empanelment Agreement
            </Link>
            .
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || hasRejected}
            className="h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="mr-2 size-5" />
                Submit for Verification
              </>
            )}
          </Button>
          {hasRejected && (
            <p className="text-xs text-center text-red-600">
              Cannot submit while documents are rejected. Please fix them first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
