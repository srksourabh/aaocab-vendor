"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import DocumentUploadCard, {
  type DocumentStatus,
} from "@/components/DocumentUploadCard";

// ---- Types ----

interface UploadState {
  status: DocumentStatus;
  file?: File;
  previewUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadProgress?: number;
}

interface BankFields {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
}

interface DriverForm {
  fullName: string;
  phone: string;
  docs: {
    license: UploadState;
    aadhaar: UploadState;
    pan: UploadState;
    photo: UploadState;
    policeVerification: UploadState;
    medicalFitness: UploadState;
  };
  bank: BankFields;
  assignedVehicles: string[];
}

// Mock vehicle list — in production this comes from the vehicles step
const MOCK_VEHICLES = [
  { id: "v1", label: "KA-01-AB-1234 (Innova)" },
  { id: "v2", label: "KA-01-CD-5678 (Sedan)" },
];

// Simulated self-driver flag — in production read from profile step state
const IS_SELF_DRIVER = false;

function makeEmptyDriver(): DriverForm {
  return {
    fullName: "",
    phone: "",
    docs: {
      license: { status: "empty" },
      aadhaar: { status: "empty" },
      pan: { status: "empty" },
      photo: { status: "empty" },
      policeVerification: { status: "empty" },
      medicalFitness: { status: "empty" },
    },
    bank: { accountHolder: "", accountNumber: "", ifscCode: "" },
    assignedVehicles: [],
  };
}

function simulateUpload(
  file: File,
  onUpdate: (state: UploadState) => void
) {
  const previewUrl = URL.createObjectURL(file);
  onUpdate({ status: "uploading", uploadProgress: 0 });

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    onUpdate({ uploadProgress: progress, status: "uploading" });
    if (progress >= 100) {
      clearInterval(interval);
      onUpdate({
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

// ---- Component ----

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<DriverForm[]>([makeEmptyDriver()]);
  const [activeIndex, setActiveIndex] = useState(0);

  function updateDriver(index: number, patch: Partial<DriverForm>) {
    setDrivers((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d))
    );
  }

  function updateDoc(
    driverIndex: number,
    docKey: keyof DriverForm["docs"],
    state: UploadState
  ) {
    setDrivers((prev) =>
      prev.map((d, i) => {
        if (i !== driverIndex) return d;
        return { ...d, docs: { ...d.docs, [docKey]: state } };
      })
    );
  }

  function handleDocUpload(
    driverIndex: number,
    docKey: keyof DriverForm["docs"],
    file: File
  ) {
    simulateUpload(file, (state) => updateDoc(driverIndex, docKey, state));
  }

  function toggleVehicle(driverIndex: number, vehicleId: string) {
    setDrivers((prev) =>
      prev.map((d, i) => {
        if (i !== driverIndex) return d;
        const has = d.assignedVehicles.includes(vehicleId);
        return {
          ...d,
          assignedVehicles: has
            ? d.assignedVehicles.filter((v) => v !== vehicleId)
            : [...d.assignedVehicles, vehicleId],
        };
      })
    );
  }

  function addDriver() {
    setDrivers((prev) => [...prev, makeEmptyDriver()]);
    setActiveIndex(drivers.length);
  }

  function handleContinue() {
    router.push("/register/review");
  }

  if (IS_SELF_DRIVER) {
    return (
      <div className="flex flex-col gap-6">
        <ProgressStepper currentStep={4} completedSteps={[1, 2, 3]} />
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8 text-center flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-[#E6F7F5] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="size-8 text-accent" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
              <circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              You are the driver
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your driver details were captured in Step 2. You can skip directly to review.
            </p>
          </div>
          <Button
            onClick={handleContinue}
            className="h-14 w-full max-w-xs rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer"
          >
            Go to Review
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </div>
    );
  }

  const driver = drivers[activeIndex];

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={4} completedSteps={[1, 2, 3]} />

      {/* Driver tabs if multiple */}
      {drivers.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {drivers.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {d.fullName || `Driver ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-baseline justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Add Driver
          </h1>
          <span className="text-sm text-muted-foreground">
            Driver {activeIndex + 1}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="driverName" className="text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="driverName"
              type="text"
              placeholder="Driver's full name"
              value={driver.fullName}
              onChange={(e) =>
                updateDriver(activeIndex, { fullName: e.target.value })
              }
              className="rounded-xl border border-input bg-background px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="driverPhone" className="text-sm font-medium text-foreground">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <div className="flex overflow-hidden rounded-xl border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all duration-200">
              <span className="flex items-center border-r border-input bg-muted px-4 text-base font-medium text-muted-foreground select-none">
                +91
              </span>
              <input
                id="driverPhone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                value={driver.phone}
                onChange={(e) =>
                  updateDriver(activeIndex, {
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                maxLength={10}
                className="flex-1 bg-transparent px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="flex flex-col gap-4 border-t border-border pt-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Driver Documents
            </h2>

            <DocumentUploadCard
              title="Driving License"
              description="Upload front and back as a single file."
              required
              status={driver.docs.license.status}
              uploadProgress={driver.docs.license.uploadProgress}
              previewUrl={driver.docs.license.previewUrl}
              fileName={driver.docs.license.fileName}
              fileSize={driver.docs.license.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "license", file)}
            />

            <DocumentUploadCard
              title="Aadhaar Card"
              required
              status={driver.docs.aadhaar.status}
              uploadProgress={driver.docs.aadhaar.uploadProgress}
              previewUrl={driver.docs.aadhaar.previewUrl}
              fileName={driver.docs.aadhaar.fileName}
              fileSize={driver.docs.aadhaar.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "aadhaar", file)}
            />

            <DocumentUploadCard
              title="PAN Card"
              required
              status={driver.docs.pan.status}
              uploadProgress={driver.docs.pan.uploadProgress}
              previewUrl={driver.docs.pan.previewUrl}
              fileName={driver.docs.pan.fileName}
              fileSize={driver.docs.pan.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "pan", file)}
            />

            <DocumentUploadCard
              title="Passport-size Photo"
              description="Recent clear face photo of the driver."
              required
              status={driver.docs.photo.status}
              uploadProgress={driver.docs.photo.uploadProgress}
              previewUrl={driver.docs.photo.previewUrl}
              fileName={driver.docs.photo.fileName}
              fileSize={driver.docs.photo.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "photo", file)}
            />

            <DocumentUploadCard
              title="Police Verification Certificate"
              required
              status={driver.docs.policeVerification.status}
              uploadProgress={driver.docs.policeVerification.uploadProgress}
              previewUrl={driver.docs.policeVerification.previewUrl}
              fileName={driver.docs.policeVerification.fileName}
              fileSize={driver.docs.policeVerification.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "policeVerification", file)}
            />

            <DocumentUploadCard
              title="Medical Fitness Certificate"
              required
              status={driver.docs.medicalFitness.status}
              uploadProgress={driver.docs.medicalFitness.uploadProgress}
              previewUrl={driver.docs.medicalFitness.previewUrl}
              fileName={driver.docs.medicalFitness.fileName}
              fileSize={driver.docs.medicalFitness.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "medicalFitness", file)}
            />

            {/* Bank details */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">
                Bank Account Details <span className="text-destructive">*</span>
              </p>
              <div className="rounded-xl border border-border bg-muted p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="driverBankHolder" className="text-sm font-medium text-foreground">
                    Account Holder Name
                  </label>
                  <input
                    id="driverBankHolder"
                    type="text"
                    placeholder="Name as per bank records"
                    value={driver.bank.accountHolder}
                    onChange={(e) =>
                      updateDriver(activeIndex, {
                        bank: { ...driver.bank, accountHolder: e.target.value },
                      })
                    }
                    className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="driverBankAccount" className="text-sm font-medium text-foreground">
                    Account Number
                  </label>
                  <input
                    id="driverBankAccount"
                    type="text"
                    inputMode="numeric"
                    placeholder="Bank account number"
                    value={driver.bank.accountNumber}
                    onChange={(e) =>
                      updateDriver(activeIndex, {
                        bank: {
                          ...driver.bank,
                          accountNumber: e.target.value.replace(/\D/g, ""),
                        },
                      })
                    }
                    className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="driverIfsc" className="text-sm font-medium text-foreground">
                    IFSC Code
                  </label>
                  <input
                    id="driverIfsc"
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={driver.bank.ifscCode}
                    onChange={(e) =>
                      updateDriver(activeIndex, {
                        bank: {
                          ...driver.bank,
                          ifscCode: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    maxLength={11}
                    className="rounded-xl border border-input bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle assignment */}
          {MOCK_VEHICLES.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border pt-5">
              <p className="text-sm font-medium text-foreground">
                Which vehicles can this driver operate?
              </p>
              <div className="flex flex-col gap-2">
                {MOCK_VEHICLES.map((v) => {
                  const isChecked = driver.assignedVehicles.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVehicle(activeIndex, v.id)}
                      aria-pressed={isChecked}
                      className={`flex min-h-[44px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                        isChecked
                          ? "border-primary bg-[#EDEDFB] text-primary"
                          : "border-border bg-muted text-foreground hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ${
                          isChecked ? "border-primary bg-primary" : "border-muted-foreground bg-white"
                        }`}
                      >
                        {isChecked && (
                          <svg viewBox="0 0 12 10" className="size-3 fill-white" aria-hidden="true">
                            <polyline points="1,5 4,8 11,1" strokeWidth="2" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={addDriver}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] border-2 border-primary text-sm font-semibold text-primary transition-all duration-200 hover:bg-[#EDEDFB] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <PlusCircle className="size-4" />
            Add Another Driver
          </button>

          <Button
            onClick={handleContinue}
            className="h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer"
          >
            Continue
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
