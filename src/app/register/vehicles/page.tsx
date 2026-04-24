"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import DocumentUploadCard, {
  type DocumentStatus,
} from "@/components/DocumentUploadCard";
import VehiclePhotoCapture, {
  type PhotoMetadata,
} from "@/components/VehiclePhotoCapture";
import VehiclePhotoAssessment from "@/components/VehiclePhotoAssessment";
import { assessVehiclePhoto, type PhotoAssessment } from "@/lib/ai/document-parser";

// ---- Constants ----

const VEHICLE_TYPES: { value: string; label: string; seats: number }[] = [
  { value: "sedan", label: "Sedan", seats: 4 },
  { value: "ertiga", label: "Ertiga", seats: 6 },
  { value: "innova", label: "Innova", seats: 7 },
  { value: "innova_crysta", label: "Innova Crysta", seats: 7 },
  { value: "12_seater", label: "12-Seater", seats: 12 },
  { value: "16_seater", label: "16-Seater", seats: 16 },
];

const MAKES = [
  "Toyota",
  "Maruti",
  "Hyundai",
  "Mahindra",
  "Force",
  "Tata",
  "Honda",
  "Other",
];

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric"];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2014 }, (_, i) =>
  String(CURRENT_YEAR - i)
);

const PHOTO_SLOTS: { type: string; label: string }[] = [
  { type: "front", label: "Front View" },
  { type: "rear", label: "Rear View" },
  { type: "left", label: "Left Side" },
  { type: "right", label: "Right Side" },
  { type: "interior_front", label: "Interior Front (Dashboard)" },
  { type: "interior_rear", label: "Interior Rear (Seats)" },
  { type: "boot", label: "Boot / Trunk" },
  { type: "odometer", label: "Odometer Reading" },
];

// ---- Types ----

interface UploadState {
  status: DocumentStatus;
  file?: File;
  previewUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadProgress?: number;
}

interface VehiclePhoto {
  file: File;
  metadata: PhotoMetadata;
  previewUrl: string;
}

interface PhotoAIState {
  scanning: boolean;
  assessment: PhotoAssessment | null;
}

interface VehicleForm {
  registrationNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  seatingCapacity: string;
  docs: {
    rc: UploadState;
    insurance: UploadState;
    fitness: UploadState;
    puc: UploadState;
    permit: UploadState;
  };
  photos: Partial<Record<string, VehiclePhoto>>;
  photoAI: Partial<Record<string, PhotoAIState>>;
}

function makeEmptyVehicle(): VehicleForm {
  return {
    registrationNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    fuelType: "",
    seatingCapacity: "",
    docs: {
      rc: { status: "empty" },
      insurance: { status: "empty" },
      fitness: { status: "empty" },
      puc: { status: "empty" },
      permit: { status: "empty" },
    },
    photos: {},
    photoAI: {},
  };
}

// ---- Helpers ----

function formatRegNumber(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const parts: string[] = [];
  if (cleaned.length > 0) parts.push(cleaned.slice(0, 2));
  if (cleaned.length > 2) parts.push(cleaned.slice(2, 4));
  if (cleaned.length > 4) parts.push(cleaned.slice(4, 6));
  if (cleaned.length > 6) parts.push(cleaned.slice(6, 10));
  return parts.join("-");
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

function computeAverageScore(
  photoAI: Partial<Record<string, PhotoAIState>>
): number | null {
  const scores = Object.values(photoAI)
    .filter(
      (ai): ai is PhotoAIState =>
        ai != null && ai.assessment != null
    )
    .map((ai) => ai.assessment!.score);

  if (scores.length === 0) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

// ---- Component ----

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleForm[]>([makeEmptyVehicle()]);
  const [activeIndex, setActiveIndex] = useState(0);

  function updateVehicle(index: number, patch: Partial<VehicleForm>) {
    setVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  }

  function handleRegNumberChange(index: number, raw: string) {
    const formatted = formatRegNumber(raw);
    updateVehicle(index, { registrationNumber: formatted });
  }

  function handleVehicleTypeChange(index: number, typeValue: string) {
    const found = VEHICLE_TYPES.find((t) => t.value === typeValue);
    updateVehicle(index, {
      vehicleType: typeValue,
      seatingCapacity: found ? String(found.seats) : "",
    });
  }

  function updateDoc(
    vehicleIndex: number,
    docKey: keyof VehicleForm["docs"],
    state: UploadState
  ) {
    setVehicles((prev) =>
      prev.map((v, i) => {
        if (i !== vehicleIndex) return v;
        return { ...v, docs: { ...v.docs, [docKey]: state } };
      })
    );
  }

  function handleDocUpload(
    vehicleIndex: number,
    docKey: keyof VehicleForm["docs"],
    file: File
  ) {
    simulateUpload(file, (state) => updateDoc(vehicleIndex, docKey, state));
  }

  const handlePhotoCapture = useCallback(
    (
      vehicleIndex: number,
      photoType: string,
      file: File,
      metadata: PhotoMetadata
    ) => {
      const previewUrl = URL.createObjectURL(file);

      // Save the photo
      setVehicles((prev) =>
        prev.map((v, i) => {
          if (i !== vehicleIndex) return v;
          return {
            ...v,
            photos: {
              ...v.photos,
              [photoType]: { file, metadata, previewUrl },
            },
            photoAI: {
              ...v.photoAI,
              [photoType]: { scanning: true, assessment: null },
            },
          };
        })
      );

      // Run AI assessment
      assessVehiclePhoto(previewUrl, photoType).then((assessment) => {
        setVehicles((prev) =>
          prev.map((v, i) => {
            if (i !== vehicleIndex) return v;
            return {
              ...v,
              photoAI: {
                ...v.photoAI,
                [photoType]: { scanning: false, assessment },
              },
            };
          })
        );
      });
    },
    []
  );

  function handlePhotoRetake(vehicleIndex: number, photoType: string) {
    setVehicles((prev) =>
      prev.map((v, i) => {
        if (i !== vehicleIndex) return v;
        const newPhotos = { ...v.photos };
        delete newPhotos[photoType];
        const newPhotoAI = { ...v.photoAI };
        delete newPhotoAI[photoType];
        return { ...v, photos: newPhotos, photoAI: newPhotoAI };
      })
    );
  }

  function addVehicle() {
    setVehicles((prev) => [...prev, makeEmptyVehicle()]);
    setActiveIndex(vehicles.length);
  }

  function handleContinue() {
    router.push("/register/drivers");
  }

  const vehicle = vehicles[activeIndex];
  const avgScore = computeAverageScore(vehicle.photoAI);

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={3} completedSteps={[1, 2]} />

      {/* Vehicle tabs if multiple */}
      {vehicles.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {vehicles.map((v, i) => (
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
              {v.registrationNumber || `Vehicle ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-baseline justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Add Your Vehicle
          </h1>
          <span className="text-sm text-muted-foreground">
            Vehicle {activeIndex + 1} of {vehicles.length}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          {/* Registration Number */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="regNumber"
              className="text-sm font-medium text-foreground"
            >
              Registration Number <span className="text-destructive">*</span>
            </label>
            <input
              id="regNumber"
              type="text"
              placeholder="e.g. KA-01-AB-1234"
              value={vehicle.registrationNumber}
              onChange={(e) =>
                handleRegNumberChange(activeIndex, e.target.value)
              }
              maxLength={13}
              className="rounded-xl border border-input bg-background px-4 py-4 text-lg font-mono text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Vehicle Type */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vehicleType"
              className="text-sm font-medium text-foreground"
            >
              Vehicle Type <span className="text-destructive">*</span>
            </label>
            <select
              id="vehicleType"
              value={vehicle.vehicleType}
              onChange={(e) =>
                handleVehicleTypeChange(activeIndex, e.target.value)
              }
              className="rounded-xl border border-input bg-background px-4 py-4 text-base text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30 cursor-pointer"
            >
              <option value="">Select vehicle type</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Make + Model row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="make"
                className="text-sm font-medium text-foreground"
              >
                Make <span className="text-destructive">*</span>
              </label>
              <select
                id="make"
                value={vehicle.make}
                onChange={(e) =>
                  updateVehicle(activeIndex, { make: e.target.value })
                }
                className="rounded-xl border border-input bg-background px-3 py-4 text-base text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30 cursor-pointer"
              >
                <option value="">Select make</option>
                {MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="model"
                className="text-sm font-medium text-foreground"
              >
                Model <span className="text-destructive">*</span>
              </label>
              <input
                id="model"
                type="text"
                placeholder="e.g. Innova"
                value={vehicle.model}
                onChange={(e) =>
                  updateVehicle(activeIndex, { model: e.target.value })
                }
                className="rounded-xl border border-input bg-background px-3 py-4 text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Year + Fuel row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="year"
                className="text-sm font-medium text-foreground"
              >
                Year <span className="text-destructive">*</span>
              </label>
              <select
                id="year"
                value={vehicle.year}
                onChange={(e) =>
                  updateVehicle(activeIndex, { year: e.target.value })
                }
                className="rounded-xl border border-input bg-background px-3 py-4 text-base text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30 cursor-pointer"
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fuelType"
                className="text-sm font-medium text-foreground"
              >
                Fuel Type <span className="text-destructive">*</span>
              </label>
              <select
                id="fuelType"
                value={vehicle.fuelType}
                onChange={(e) =>
                  updateVehicle(activeIndex, { fuelType: e.target.value })
                }
                className="rounded-xl border border-input bg-background px-3 py-4 text-base text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30 cursor-pointer"
              >
                <option value="">Select fuel</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seating Capacity — auto-filled */}
          {vehicle.seatingCapacity && (
            <div className="rounded-xl border border-border bg-muted px-4 py-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Seating Capacity:
              </span>
              <span className="text-sm font-semibold text-foreground">
                {vehicle.seatingCapacity} passengers
              </span>
            </div>
          )}

          {/* Vehicle Documents */}
          <div className="flex flex-col gap-4 border-t border-border pt-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Vehicle Documents
            </h2>

            <DocumentUploadCard
              title="RC Book"
              description="Registration Certificate of the vehicle."
              required
              status={vehicle.docs.rc.status}
              uploadProgress={vehicle.docs.rc.uploadProgress}
              previewUrl={vehicle.docs.rc.previewUrl}
              fileName={vehicle.docs.rc.fileName}
              fileSize={vehicle.docs.rc.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "rc", file)}
            />

            <DocumentUploadCard
              title="Insurance Certificate"
              required
              status={vehicle.docs.insurance.status}
              uploadProgress={vehicle.docs.insurance.uploadProgress}
              previewUrl={vehicle.docs.insurance.previewUrl}
              fileName={vehicle.docs.insurance.fileName}
              fileSize={vehicle.docs.insurance.fileSize}
              onUpload={(file) =>
                handleDocUpload(activeIndex, "insurance", file)
              }
            />

            <DocumentUploadCard
              title="Fitness Certificate"
              required
              status={vehicle.docs.fitness.status}
              uploadProgress={vehicle.docs.fitness.uploadProgress}
              previewUrl={vehicle.docs.fitness.previewUrl}
              fileName={vehicle.docs.fitness.fileName}
              fileSize={vehicle.docs.fitness.fileSize}
              onUpload={(file) =>
                handleDocUpload(activeIndex, "fitness", file)
              }
            />

            <DocumentUploadCard
              title="PUC Certificate"
              required
              status={vehicle.docs.puc.status}
              uploadProgress={vehicle.docs.puc.uploadProgress}
              previewUrl={vehicle.docs.puc.previewUrl}
              fileName={vehicle.docs.puc.fileName}
              fileSize={vehicle.docs.puc.fileSize}
              onUpload={(file) => handleDocUpload(activeIndex, "puc", file)}
            />

            <DocumentUploadCard
              title="Permit"
              description="Tourist permit or commercial permit (if applicable)."
              required={false}
              status={vehicle.docs.permit.status}
              uploadProgress={vehicle.docs.permit.uploadProgress}
              previewUrl={vehicle.docs.permit.previewUrl}
              fileName={vehicle.docs.permit.fileName}
              fileSize={vehicle.docs.permit.fileSize}
              onUpload={(file) =>
                handleDocUpload(activeIndex, "permit", file)
              }
            />
          </div>

          {/* Vehicle Photos */}
          <div className="flex flex-col gap-4 border-t border-border pt-5">
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Vehicle Photos
              </h2>
              <p className="text-sm text-muted-foreground">
                Take photos from the required angles. Timestamp is added
                automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {PHOTO_SLOTS.map((slot) => {
                const photo = vehicle.photos[slot.type];
                const ai = vehicle.photoAI[slot.type];

                return (
                  <div key={slot.type} className="flex flex-col gap-2">
                    {/* Show the capture component if no photo yet, or if user needs to retake */}
                    {!photo ? (
                      <VehiclePhotoCapture
                        photoType={slot.type}
                        label={slot.label}
                        onCapture={(file, metadata) =>
                          handlePhotoCapture(
                            activeIndex,
                            slot.type,
                            file,
                            metadata
                          )
                        }
                      />
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-medium text-foreground">
                          {slot.label}
                        </p>

                        {/* Scanning state */}
                        {ai?.scanning && (
                          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-[#EDEDFB] px-3 py-3">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span className="text-xs font-medium text-primary">
                              Analyzing photo...
                            </span>
                          </div>
                        )}

                        {/* Assessment result */}
                        {ai?.assessment && (
                          <VehiclePhotoAssessment
                            photoUrl={photo.previewUrl}
                            photoType={slot.type}
                            assessment={ai.assessment}
                            onRetake={() =>
                              handlePhotoRetake(activeIndex, slot.type)
                            }
                          />
                        )}

                        {/* Photo taken but AI hasn't run yet — show thumbnail */}
                        {!ai && (
                          <div className="relative overflow-hidden rounded-xl border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.previewUrl}
                              alt={slot.label}
                              className="h-36 w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall vehicle condition score */}
            {avgScore !== null && (
              <div className="rounded-xl border border-border bg-muted px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Overall Vehicle Condition Score
                </span>
                <span
                  className={`text-lg font-bold ${
                    avgScore >= 8
                      ? "text-green-700"
                      : avgScore >= 6
                        ? "text-amber-700"
                        : "text-red-700"
                  }`}
                >
                  {avgScore}/10
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={addVehicle}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] border-2 border-primary text-sm font-semibold text-primary transition-all duration-200 hover:bg-[#EDEDFB] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <PlusCircle className="size-4" />
            Add Another Vehicle
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
