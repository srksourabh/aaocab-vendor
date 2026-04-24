"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import DocumentUploadCard, {
  type DocumentStatus,
} from "@/components/DocumentUploadCard";
import { cn } from "@/lib/utils";

interface UploadState {
  status: DocumentStatus;
  file?: File;
  previewUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadProgress?: number;
}

interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

function makeEmptyUpload(): UploadState {
  return { status: "empty" };
}

export default function DocumentsPage() {
  const router = useRouter();
  const [hasGst, setHasGst] = useState(false);

  const [pan, setPan] = useState<UploadState>(makeEmptyUpload());
  const [aadhaar, setAadhaar] = useState<UploadState>(makeEmptyUpload());
  const [gst, setGst] = useState<UploadState>(makeEmptyUpload());

  const [bank, setBank] = useState<BankDetails>({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [bankErrors, setBankErrors] = useState<Partial<BankDetails>>({});

  function simulateUpload(
    file: File,
    setter: React.Dispatch<React.SetStateAction<UploadState>>
  ) {
    const previewUrl = URL.createObjectURL(file);
    setter({ status: "uploading", uploadProgress: 0 });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setter((prev) => ({ ...prev, uploadProgress: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setter({
          status: "uploaded",
          file,
          previewUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadProgress: 100,
        });
      }
    }, 200);
  }

  function validateBank(): boolean {
    const errs: Partial<BankDetails> = {};
    if (!bank.accountHolder.trim()) errs.accountHolder = "Required";
    if (!bank.accountNumber.trim()) errs.accountNumber = "Required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bank.ifscCode.trim()))
      errs.ifscCode = "Enter a valid IFSC code (e.g. SBIN0001234)";
    if (!bank.bankName.trim()) errs.bankName = "Required";
    setBankErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const requiredUploaded =
    pan.status !== "empty" && aadhaar.status !== "empty";
  const gstUploaded = !hasGst || gst.status !== "empty";
  const bankFilled =
    bank.accountHolder.trim() &&
    bank.accountNumber.trim() &&
    bank.ifscCode.trim() &&
    bank.bankName.trim();

  const canContinue = requiredUploaded && gstUploaded && !!bankFilled;

  function handleContinue() {
    if (!validateBank()) return;
    if (!canContinue) return;
    router.push("/register/vehicles");
  }

  function handleSaveLater() {
    // Placeholder: save partial state
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={2} completedSteps={[1]} />

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Upload Your Business Documents
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          All documents are securely stored. Max file size: 5MB each.
        </p>

        <div className="mt-6 flex flex-col gap-6">
          {/* PAN Card */}
          <DocumentUploadCard
            title="PAN Card"
            description="Upload a clear image or scan of your PAN card."
            required
            status={pan.status}
            uploadProgress={pan.uploadProgress}
            previewUrl={pan.previewUrl}
            fileName={pan.fileName}
            fileSize={pan.fileSize}
            onUpload={(file) => simulateUpload(file, setPan)}
          />

          {/* Aadhaar Card */}
          <DocumentUploadCard
            title="Aadhaar Card"
            description="Upload front and back of your Aadhaar card as a single file."
            required
            status={aadhaar.status}
            uploadProgress={aadhaar.uploadProgress}
            previewUrl={aadhaar.previewUrl}
            fileName={aadhaar.fileName}
            fileSize={aadhaar.fileSize}
            onUpload={(file) => simulateUpload(file, setAadhaar)}
          />

          {/* GST Certificate — conditional */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setHasGst((v) => !v)}
              aria-pressed={hasGst}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30",
                hasGst ? "border-primary bg-[#EDEDFB]" : "border-border bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
                  hasGst ? "border-primary bg-primary" : "border-muted-foreground bg-white"
                )}
              >
                {hasGst && (
                  <svg viewBox="0 0 12 10" className="size-3 fill-white" aria-hidden="true">
                    <polyline points="1,5 4,8 11,1" strokeWidth="2" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">I have GST registration</p>
                <p className="text-xs text-muted-foreground">
                  Check this if your business is GST registered
                </p>
              </div>
            </button>

            {hasGst && (
              <DocumentUploadCard
                title="GST Certificate"
                description="Upload your GST registration certificate."
                required
                status={gst.status}
                uploadProgress={gst.uploadProgress}
                previewUrl={gst.previewUrl}
                fileName={gst.fileName}
                fileSize={gst.fileSize}
                onUpload={(file) => simulateUpload(file, setGst)}
              />
            )}
          </div>

          {/* Bank Account Details — form */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Bank Account Details <span className="text-destructive">*</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Payments will be credited to this account.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 flex flex-col gap-4">
              {/* Account Holder */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="accountHolder" className="text-sm font-medium text-foreground">
                  Account Holder Name
                </label>
                <input
                  id="accountHolder"
                  type="text"
                  placeholder="Name as per bank records"
                  value={bank.accountHolder}
                  onChange={(e) =>
                    setBank((prev) => ({ ...prev, accountHolder: e.target.value }))
                  }
                  aria-invalid={!!bankErrors.accountHolder}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.accountHolder && (
                  <p className="text-sm text-destructive">{bankErrors.accountHolder}</p>
                )}
              </div>

              {/* Account Number */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="accountNumber" className="text-sm font-medium text-foreground">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="Your bank account number"
                  value={bank.accountNumber}
                  onChange={(e) =>
                    setBank((prev) => ({
                      ...prev,
                      accountNumber: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  aria-invalid={!!bankErrors.accountNumber}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.accountNumber && (
                  <p className="text-sm text-destructive">{bankErrors.accountNumber}</p>
                )}
              </div>

              {/* IFSC Code */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ifscCode" className="text-sm font-medium text-foreground">
                  IFSC Code
                </label>
                <input
                  id="ifscCode"
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={bank.ifscCode}
                  onChange={(e) =>
                    setBank((prev) => ({
                      ...prev,
                      ifscCode: e.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={11}
                  aria-invalid={!!bankErrors.ifscCode}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.ifscCode && (
                  <p className="text-sm text-destructive">{bankErrors.ifscCode}</p>
                )}
              </div>

              {/* Bank Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="bankName" className="text-sm font-medium text-foreground">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={bank.bankName}
                  onChange={(e) =>
                    setBank((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  aria-invalid={!!bankErrors.bankName}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.bankName && (
                  <p className="text-sm text-destructive">{bankErrors.bankName}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] disabled:opacity-50 cursor-pointer"
          >
            Continue
            <ArrowRight className="ml-2 size-5" />
          </Button>

          <button
            type="button"
            onClick={handleSaveLater}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] border border-border text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <Save className="size-4" />
            Save &amp; Continue Later
          </button>
        </div>
      </div>
    </div>
  );
}
