"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Save,
  Loader2,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import DocumentUploadCard, {
  type DocumentStatus,
} from "@/components/DocumentUploadCard";
import dynamic from "next/dynamic";

const DocumentVerificationCard = dynamic(
  () => import("@/components/DocumentVerificationCard"),
  { ssr: false }
);
import { cn } from "@/lib/utils";
import {
  parseDocument,
  verifyDocument,
  type ExtractedDocumentData,
  type VerificationResult,
} from "@/lib/ai/document-parser";
import { namesMatch } from "@/lib/ai/levenshtein";
import { useLanguage } from "@/lib/i18n/context";
import { saveFormProgress, loadFormProgress } from "@/lib/offline-storage";

// ---- Types ----

interface UploadState {
  status: DocumentStatus;
  file?: File;
  previewUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadProgress?: number;
}

interface AIState {
  scanning: boolean;
  extractedData: ExtractedDocumentData | null;
  verification: VerificationResult | null;
  confirmed: boolean;
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

function makeEmptyAI(): AIState {
  return { scanning: false, extractedData: null, verification: null, confirmed: false };
}

const STEP_KEY = "register_documents";

// ---- Cross-verification summary ----

interface CrossCheckItem {
  label: string;
  passed: boolean;
  detail: string;
}

function buildCrossChecks(
  panAI: AIState,
  aadhaarAI: AIState,
  labelText: string,
  bothSayText: string,
  panSaysText: string,
  aadhaarSaysText: string
): CrossCheckItem[] {
  const items: CrossCheckItem[] = [];

  const panName = panAI.extractedData?.fields.name ?? null;
  const aadhaarName = aadhaarAI.extractedData?.fields.name ?? null;

  if (panName && aadhaarName) {
    const match = namesMatch(panName, aadhaarName);
    items.push({
      label: labelText,
      passed: match,
      detail: match
        ? `${bothSayText} "${panName}"`
        : `${panSaysText} "${panName}", ${aadhaarSaysText} "${aadhaarName}"`,
    });
  }

  return items;
}

// ---- Component ----

export default function DocumentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [hasGst, setHasGst] = useState(false);

  // Upload states
  const [pan, setPan] = useState<UploadState>(makeEmptyUpload());
  const [aadhaar, setAadhaar] = useState<UploadState>(makeEmptyUpload());
  const [gst, setGst] = useState<UploadState>(makeEmptyUpload());

  // AI verification states
  const [panAI, setPanAI] = useState<AIState>(makeEmptyAI());
  const [aadhaarAI, setAadhaarAI] = useState<AIState>(makeEmptyAI());

  // Bank details
  const [bank, setBank] = useState<BankDetails>({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [bankErrors, setBankErrors] = useState<Partial<BankDetails>>({});

  // Restore saved bank form data on mount
  useEffect(() => {
    const saved = loadFormProgress(STEP_KEY);
    if (saved) {
      setBank({
        accountHolder: typeof saved.accountHolder === "string" ? saved.accountHolder : "",
        accountNumber: typeof saved.accountNumber === "string" ? saved.accountNumber : "",
        ifscCode: typeof saved.ifscCode === "string" ? saved.ifscCode : "",
        bankName: typeof saved.bankName === "string" ? saved.bankName : "",
      });
      if (saved.hasGst === true) setHasGst(true);
    }
  }, []);

  function saveBank(updated: BankDetails) {
    saveFormProgress(STEP_KEY, {
      ...updated,
      hasGst,
    } as unknown as Record<string, unknown>);
  }

  // ---- Upload + AI scan ----

  const simulateUploadAndScan = useCallback(
    (
      file: File,
      docType: string,
      uploadSetter: React.Dispatch<React.SetStateAction<UploadState>>,
      aiSetter: React.Dispatch<React.SetStateAction<AIState>>
    ) => {
      const previewUrl = URL.createObjectURL(file);
      uploadSetter({ status: "uploading", uploadProgress: 0 });
      aiSetter(makeEmptyAI());

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        uploadSetter((prev) => ({ ...prev, uploadProgress: progress }));
        if (progress >= 100) {
          clearInterval(interval);
          uploadSetter({
            status: "uploaded",
            file,
            previewUrl,
            fileName: file.name,
            fileSize: file.size,
            uploadProgress: 100,
          });

          // Start AI scan
          aiSetter((prev) => ({ ...prev, scanning: true }));
          parseDocument(previewUrl, docType).then((extracted) => {
            aiSetter((prev) => ({
              ...prev,
              scanning: false,
              extractedData: extracted,
            }));
          });
        }
      }, 200);
    },
    []
  );

  // ---- AI verification after user confirms or corrects ----

  async function handleConfirm(
    ai: AIState,
    aiSetter: React.Dispatch<React.SetStateAction<AIState>>,
    uploadSetter: React.Dispatch<React.SetStateAction<UploadState>>,
    crossRefName?: string
  ) {
    if (!ai.extractedData) return;

    const crossRef: Record<string, string> = {};
    if (crossRefName) {
      crossRef.name = crossRefName;
    }

    const result = await verifyDocument(ai.extractedData, crossRef);
    aiSetter((prev) => ({ ...prev, verification: result, confirmed: true }));

    if (result.status === "passed") {
      uploadSetter((prev) => ({ ...prev, status: "verified" as DocumentStatus }));
    } else if (result.status === "rejected") {
      uploadSetter((prev) => ({ ...prev, status: "rejected" as DocumentStatus }));
    }
  }

  async function handleCorrect(
    correctedFields: Record<string, string>,
    docType: string,
    aiSetter: React.Dispatch<React.SetStateAction<AIState>>,
    uploadSetter: React.Dispatch<React.SetStateAction<UploadState>>,
    crossRefName?: string
  ) {
    const updatedData: ExtractedDocumentData = {
      documentType: docType,
      fields: correctedFields,
      confidence: 1.0,
      rawText: "",
    };

    aiSetter((prev) => ({ ...prev, extractedData: updatedData }));

    const crossRef: Record<string, string> = {};
    if (crossRefName) {
      crossRef.name = crossRefName;
    }

    const result = await verifyDocument(updatedData, crossRef);
    aiSetter((prev) => ({ ...prev, verification: result, confirmed: true }));

    if (result.status === "passed") {
      uploadSetter((prev) => ({ ...prev, status: "verified" as DocumentStatus }));
    } else if (result.status === "rejected") {
      uploadSetter((prev) => ({ ...prev, status: "rejected" as DocumentStatus }));
    }
  }

  // ---- Bank validation ----

  function validateBank(): boolean {
    const errs: Partial<BankDetails> = {};
    if (!bank.accountHolder.trim()) errs.accountHolder = t("required");
    if (!bank.accountNumber.trim()) errs.accountNumber = t("required");
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bank.ifscCode.trim()))
      errs.ifscCode = t("invalidIfsc");
    if (!bank.bankName.trim()) errs.bankName = t("required");
    setBankErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ---- Navigation ----

  const requiredUploaded =
    pan.status !== "empty" && aadhaar.status !== "empty";
  const gstUploaded = !hasGst || gst.status !== "empty";
  const bankFilled =
    bank.accountHolder.trim() &&
    bank.accountNumber.trim() &&
    bank.ifscCode.trim() &&
    bank.bankName.trim();
  const hasRejected =
    panAI.verification?.status === "rejected" ||
    aadhaarAI.verification?.status === "rejected";

  const canContinue = requiredUploaded && gstUploaded && !!bankFilled && !hasRejected;

  function handleContinue() {
    if (!validateBank()) return;
    if (!canContinue) return;
    router.push("/register/vehicles");
  }

  function handleSaveLater() {
    router.push("/");
  }

  // Cross-verification items
  const crossChecks = buildCrossChecks(
    panAI,
    aadhaarAI,
    t("nameOnPanMatchesAadhaar"),
    t("bothSay"),
    t("panSays"),
    t("aadhaarSays")
  );

  // Overall doc status
  const allVerified =
    panAI.confirmed &&
    aadhaarAI.confirmed &&
    panAI.verification?.status === "passed" &&
    aadhaarAI.verification?.status === "passed";
  const issueCount = [panAI, aadhaarAI].filter(
    (ai) => ai.verification && ai.verification.status !== "passed"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={2} completedSteps={[1]} />

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          {t("documentsPageTitle")}
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          {t("documentsPageSubtitle")}
        </p>

        <div className="mt-6 flex flex-col gap-6">
          {/* PAN Card */}
          <DocumentUploadCard
            title={t("panCard")}
            description={t("panCardDesc")}
            required
            status={pan.status}
            uploadProgress={pan.uploadProgress}
            previewUrl={pan.previewUrl}
            fileName={pan.fileName}
            fileSize={pan.fileSize}
            onUpload={(file) =>
              simulateUploadAndScan(file, "pan", setPan, setPanAI)
            }
          />

          {/* PAN AI scanning / verification */}
          {panAI.scanning && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-[#EDEDFB] px-4 py-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("scanningPan")}
              </span>
            </div>
          )}
          {panAI.extractedData && !panAI.scanning && (
            <DocumentVerificationCard
              extractedData={panAI.extractedData}
              verification={
                panAI.verification ?? {
                  status: "passed",
                  notes: "",
                  checks: [],
                }
              }
              onConfirm={() => {
                const crossRefName = aadhaarAI.extractedData?.fields.name;
                handleConfirm(panAI, setPanAI, setPan, crossRefName);
              }}
              onCorrect={(fields) => {
                const crossRefName = aadhaarAI.extractedData?.fields.name;
                handleCorrect(fields, "pan", setPanAI, setPan, crossRefName);
              }}
            />
          )}

          {/* Aadhaar Card */}
          <DocumentUploadCard
            title={t("aadhaarCard")}
            description={t("aadhaarCardDesc")}
            required
            status={aadhaar.status}
            uploadProgress={aadhaar.uploadProgress}
            previewUrl={aadhaar.previewUrl}
            fileName={aadhaar.fileName}
            fileSize={aadhaar.fileSize}
            onUpload={(file) =>
              simulateUploadAndScan(file, "aadhaar", setAadhaar, setAadhaarAI)
            }
          />

          {/* Aadhaar AI scanning / verification */}
          {aadhaarAI.scanning && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-[#EDEDFB] px-4 py-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">
                {t("scanningAadhaar")}
              </span>
            </div>
          )}
          {aadhaarAI.extractedData && !aadhaarAI.scanning && (
            <DocumentVerificationCard
              extractedData={aadhaarAI.extractedData}
              verification={
                aadhaarAI.verification ?? {
                  status: "passed",
                  notes: "",
                  checks: [],
                }
              }
              onConfirm={() => {
                const crossRefName = panAI.extractedData?.fields.name;
                handleConfirm(aadhaarAI, setAadhaarAI, setAadhaar, crossRefName);
              }}
              onCorrect={(fields) => {
                const crossRefName = panAI.extractedData?.fields.name;
                handleCorrect(
                  fields,
                  "aadhaar",
                  setAadhaarAI,
                  setAadhaar,
                  crossRefName
                );
              }}
            />
          )}

          {/* GST Certificate — conditional */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                const next = !hasGst;
                setHasGst(next);
                saveFormProgress(STEP_KEY, {
                  ...bank,
                  hasGst: next,
                } as unknown as Record<string, unknown>);
              }}
              aria-pressed={hasGst}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30",
                hasGst
                  ? "border-primary bg-[#EDEDFB]"
                  : "border-border bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
                  hasGst
                    ? "border-primary bg-primary"
                    : "border-muted-foreground bg-white"
                )}
              >
                {hasGst && (
                  <svg
                    viewBox="0 0 12 10"
                    className="size-3 fill-white"
                    aria-hidden="true"
                  >
                    <polyline
                      points="1,5 4,8 11,1"
                      strokeWidth="2"
                      stroke="white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("iHaveGst")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("iHaveGstDesc")}
                </p>
              </div>
            </button>

            {hasGst && (
              <DocumentUploadCard
                title={t("gstCertificate")}
                description={t("gstCertificateDesc")}
                required
                status={gst.status}
                uploadProgress={gst.uploadProgress}
                previewUrl={gst.previewUrl}
                fileName={gst.fileName}
                fileSize={gst.fileSize}
                onUpload={(file) => {
                  const previewUrl = URL.createObjectURL(file);
                  setGst({ status: "uploading", uploadProgress: 0 });
                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 20;
                    setGst((prev) => ({ ...prev, uploadProgress: progress }));
                    if (progress >= 100) {
                      clearInterval(interval);
                      setGst({
                        status: "uploaded",
                        file,
                        previewUrl,
                        fileName: file.name,
                        fileSize: file.size,
                        uploadProgress: 100,
                      });
                    }
                  }, 200);
                }}
              />
            )}
          </div>

          {/* Bank Account Details — form */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("bankAccountDetails")} <span className="text-destructive">*</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {t("bankAccountDesc")}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 flex flex-col gap-4">
              {/* Account Holder */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="accountHolder"
                  className="text-sm font-medium text-foreground"
                >
                  {t("accountHolderName")}
                </label>
                <input
                  id="accountHolder"
                  type="text"
                  placeholder={t("accountHolderPlaceholder")}
                  value={bank.accountHolder}
                  onChange={(e) => {
                    const updated = { ...bank, accountHolder: e.target.value };
                    setBank(updated);
                    saveBank(updated);
                  }}
                  aria-invalid={!!bankErrors.accountHolder}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.accountHolder && (
                  <p className="text-sm text-destructive">
                    {bankErrors.accountHolder}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="accountNumber"
                  className="text-sm font-medium text-foreground"
                >
                  {t("accountNumber")}
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder={t("accountNumberPlaceholder")}
                  value={bank.accountNumber}
                  onChange={(e) => {
                    const updated = { ...bank, accountNumber: e.target.value.replace(/\D/g, "") };
                    setBank(updated);
                    saveBank(updated);
                  }}
                  aria-invalid={!!bankErrors.accountNumber}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.accountNumber && (
                  <p className="text-sm text-destructive">
                    {bankErrors.accountNumber}
                  </p>
                )}
              </div>

              {/* IFSC Code */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="ifscCode"
                  className="text-sm font-medium text-foreground"
                >
                  {t("ifscCode")}
                </label>
                <input
                  id="ifscCode"
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={bank.ifscCode}
                  onChange={(e) => {
                    const updated = { ...bank, ifscCode: e.target.value.toUpperCase() };
                    setBank(updated);
                    saveBank(updated);
                  }}
                  maxLength={11}
                  aria-invalid={!!bankErrors.ifscCode}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.ifscCode && (
                  <p className="text-sm text-destructive">
                    {bankErrors.ifscCode}
                  </p>
                )}
              </div>

              {/* Bank Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bankName"
                  className="text-sm font-medium text-foreground"
                >
                  {t("bankName")}
                </label>
                <input
                  id="bankName"
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={bank.bankName}
                  onChange={(e) => {
                    const updated = { ...bank, bankName: e.target.value };
                    setBank(updated);
                    saveBank(updated);
                  }}
                  aria-invalid={!!bankErrors.bankName}
                  className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                {bankErrors.bankName && (
                  <p className="text-sm text-destructive">
                    {bankErrors.bankName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Verification Summary */}
        {(crossChecks.length > 0 || panAI.confirmed || aadhaarAI.confirmed) && (
          <div className="mt-6 rounded-xl border border-border bg-muted p-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t("verificationSummary")}
            </h3>

            {/* Cross-checks */}
            {crossChecks.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                {item.passed ? (
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-green-600"
                    strokeWidth={2.5}
                  />
                ) : (
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600"
                    strokeWidth={2.5}
                  />
                )}
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {item.label}{" "}
                    {item.passed ? (
                      <span className="text-green-600">{t("passed")}</span>
                    ) : (
                      <span className="text-amber-600">{t("mismatch")}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}

            {/* Overall status line */}
            <div className="border-t border-border pt-2 mt-1">
              {allVerified ? (
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <Check className="size-4" strokeWidth={2.5} />
                  {t("allDocsVerified")}
                </div>
              ) : issueCount > 0 ? (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <AlertTriangle className="size-4" strokeWidth={2.5} />
                  {issueCount} {issueCount !== 1 ? t("docsNeedAttentionPlural") : t("docsNeedAttention")}
                </div>
              ) : hasRejected ? (
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <X className="size-4" strokeWidth={2.5} />
                  {t("docsRejected")}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {t("confirmDocsAbove")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] disabled:opacity-50 cursor-pointer"
          >
            {t("continue")}
            <ArrowRight className="ml-2 size-5" />
          </Button>

          <button
            type="button"
            onClick={handleSaveLater}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] border border-border text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <Save className="size-4" />
            {t("saveLater")}
          </button>
        </div>
      </div>
    </div>
  );
}
