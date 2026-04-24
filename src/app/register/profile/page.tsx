"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Car, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressStepper from "@/components/ProgressStepper";
import { cn } from "@/lib/utils";

type FleetSize = "1" | "2-5" | "5+";

interface ProfileForm {
  businessName: string;
  ownerName: string;
  city: string;
  isSelfDriver: boolean;
  fleetSize: FleetSize | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    businessName: "",
    ownerName: "",
    city: "",
    isSelfDriver: false,
    fleetSize: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSelfDriverToggle() {
    const next = !form.isSelfDriver;
    setForm((prev) => ({
      ...prev,
      isSelfDriver: next,
      fleetSize: next ? "1" : null,
    }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ProfileForm, string>> = {};
    if (!form.businessName.trim()) newErrors.businessName = "Business or your name is required.";
    if (!form.ownerName.trim()) newErrors.ownerName = "Owner name is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.fleetSize) newErrors.fleetSize = "Please select your fleet size.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleContinue() {
    if (!validate()) return;
    // Placeholder: store form data (in production, persist to Supabase)
    router.push("/register/documents");
  }

  const fleetOptions: { value: FleetSize; label: string }[] = [
    { value: "1", label: "1 car" },
    { value: "2-5", label: "2–5 cars" },
    { value: "5+", label: "5+ cars" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper currentStep={2} completedSteps={[1]} />

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Tell us about yourself
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          This information helps us set up your vendor account.
        </p>

        <div className="mt-6 flex flex-col gap-5">
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessName" className="text-sm font-medium text-foreground">
              Business / Your Name <span className="text-destructive">*</span>
            </label>
            <input
              id="businessName"
              type="text"
              placeholder="e.g. Sharma Travels or Rajesh Kumar"
              value={form.businessName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField("businessName", e.target.value)
              }
              aria-invalid={!!errors.businessName}
              aria-describedby={errors.businessName ? "businessName-error" : undefined}
              className="rounded-xl border border-input bg-background px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            {errors.businessName && (
              <p id="businessName-error" className="text-sm text-destructive">
                {errors.businessName}
              </p>
            )}
          </div>

          {/* Owner Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ownerName" className="text-sm font-medium text-foreground">
              Owner Name <span className="text-destructive">*</span>
            </label>
            <input
              id="ownerName"
              type="text"
              placeholder="Your full name as on official ID"
              value={form.ownerName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField("ownerName", e.target.value)
              }
              aria-invalid={!!errors.ownerName}
              aria-describedby={errors.ownerName ? "ownerName-error" : undefined}
              className="rounded-xl border border-input bg-background px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            {errors.ownerName && (
              <p id="ownerName-error" className="text-sm text-destructive">
                {errors.ownerName}
              </p>
            )}
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="text-sm font-medium text-foreground">
              City <span className="text-destructive">*</span>
            </label>
            <input
              id="city"
              type="text"
              placeholder="e.g. Bangalore, Mumbai, Delhi"
              value={form.city}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField("city", e.target.value)
              }
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              className="rounded-xl border border-input bg-background px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            {errors.city && (
              <p id="city-error" className="text-sm text-destructive">
                {errors.city}
              </p>
            )}
          </div>

          {/* Self-driver toggle — key UX element */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Your role <span className="text-destructive">*</span>
            </p>
            <button
              type="button"
              onClick={handleSelfDriverToggle}
              aria-pressed={form.isSelfDriver}
              className={cn(
                "flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30",
                form.isSelfDriver
                  ? "border-accent bg-[#E6F7F5]"
                  : "border-border bg-muted hover:border-primary/40"
              )}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                  form.isSelfDriver
                    ? "bg-accent text-white"
                    : "bg-white text-muted-foreground"
                )}
              >
                {form.isSelfDriver ? (
                  <Car className="size-6" />
                ) : (
                  <Users className="size-6" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-semibold transition-colors duration-200",
                    form.isSelfDriver ? "text-accent" : "text-foreground"
                  )}
                >
                  {form.isSelfDriver ? "I drive my own car" : "I have drivers who work for me"}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {form.isSelfDriver
                    ? "You are the sole driver for your vehicle."
                    : "You manage one or more drivers and vehicles."}
                </p>
              </div>
              {/* Toggle indicator */}
              <div
                className={cn(
                  "relative flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200",
                  form.isSelfDriver ? "bg-accent" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute size-5 rounded-full bg-white shadow transition-all duration-200",
                    form.isSelfDriver ? "left-[22px]" : "left-0.5"
                  )}
                />
              </div>
            </button>
          </div>

          {/* Fleet size */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Fleet size <span className="text-destructive">*</span>
            </p>
            <div className="flex gap-2">
              {fleetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (!form.isSelfDriver) updateField("fleetSize", option.value);
                  }}
                  disabled={form.isSelfDriver}
                  aria-pressed={form.fleetSize === option.value}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30",
                    form.fleetSize === option.value
                      ? "border-primary bg-[#EDEDFB] text-primary"
                      : "border-border bg-white text-muted-foreground hover:border-primary/40",
                    form.isSelfDriver && "cursor-not-allowed opacity-50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.fleetSize && (
              <p className="text-sm text-destructive">{errors.fleetSize}</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className="mt-8 h-14 w-full rounded-[40px] bg-primary text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer"
        >
          Continue
          <ArrowRight className="ml-2 size-5" />
        </Button>
      </div>
    </div>
  );
}
