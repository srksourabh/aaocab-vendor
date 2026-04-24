"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Phone,
  MapPin,
  Car,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_VENDOR } from "@/lib/mock-data";

const ONBOARDING_TIMELINE = [
  { key: "phone_verified", label: "Phone Verified", done: true },
  { key: "profile_completed", label: "Business Profile Submitted", done: true },
  { key: "documents_uploaded", label: "Documents Uploaded", done: true },
  { key: "vehicles_added", label: "Vehicles Added", done: true },
  { key: "under_review", label: "Under Review", done: true },
  { key: "active", label: "Account Activated", done: MOCK_VENDOR.onboarding_status === "active" },
];

// Masked bank details for demo
const DEMO_BANK = {
  account_number: "****1234",
  ifsc: "SBIN0001234",
  holder_name: "Rajesh Roy",
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 items-center justify-center rounded-lg bg-muted shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  const statusLabel =
    MOCK_VENDOR.onboarding_status === "active"
      ? "Active"
      : MOCK_VENDOR.onboarding_status === "under_review"
      ? "Under Review"
      : MOCK_VENDOR.onboarding_status;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="font-heading text-xl font-bold text-foreground">
        Profile
      </h1>

      {/* Business profile card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Business Profile
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
          >
            <Edit className="size-3.5" />
            {editingProfile ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {editingProfile ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Business Name
              </label>
              <input
                type="text"
                defaultValue={MOCK_VENDOR.business_name}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Owner Name
              </label>
              <input
                type="text"
                defaultValue={MOCK_VENDOR.owner_name}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                City
              </label>
              <input
                type="text"
                defaultValue={MOCK_VENDOR.city}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <Button
              onClick={() => setEditingProfile(false)}
              className="bg-primary text-primary-foreground hover:bg-[#3D3CB8] transition-all duration-200 cursor-pointer"
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InfoRow
              icon={Building2}
              label="Business Name"
              value={MOCK_VENDOR.business_name}
            />
            <InfoRow
              icon={User}
              label="Owner Name"
              value={MOCK_VENDOR.owner_name}
            />
            <InfoRow
              icon={Phone}
              label="Mobile Number"
              value={`+91 ${MOCK_VENDOR.phone}`}
            />
            <InfoRow icon={MapPin} label="City" value={MOCK_VENDOR.city} />
            <InfoRow
              icon={Car}
              label="Self-Driver"
              value={MOCK_VENDOR.is_self_driver ? "Yes" : "No"}
            />
          </div>
        )}
      </div>

      {/* Bank details card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Bank Details
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingBank(!editingBank)}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
          >
            <Edit className="size-3.5" />
            {editingBank ? "Cancel" : "Update"}
          </Button>
        </div>

        {editingBank ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Enter account number"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                IFSC Code
              </label>
              <input
                type="text"
                defaultValue={DEMO_BANK.ifsc}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Account Holder Name
              </label>
              <input
                type="text"
                defaultValue={DEMO_BANK.holder_name}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <Button
              onClick={() => setEditingBank(false)}
              className="bg-primary text-primary-foreground hover:bg-[#3D3CB8] transition-all duration-200 cursor-pointer"
              size="sm"
            >
              Save Bank Details
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InfoRow
              icon={CreditCard}
              label="Account Number"
              value={DEMO_BANK.account_number}
            />
            <InfoRow
              icon={FileText}
              label="IFSC Code"
              value={DEMO_BANK.ifsc}
            />
            <InfoRow
              icon={User}
              label="Account Holder"
              value={DEMO_BANK.holder_name}
            />
          </div>
        )}
      </div>

      {/* Agreement & status card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <h2 className="font-heading text-base font-semibold text-foreground mb-5">
          Account Status
        </h2>

        <div className="flex items-center gap-3 mb-5">
          <div
            className={`flex size-9 items-center justify-center rounded-full ${
              MOCK_VENDOR.onboarding_status === "active"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {MOCK_VENDOR.onboarding_status === "active" ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <Clock className="size-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {statusLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {MOCK_VENDOR.onboarding_status === "active"
                ? "Your account is active and accepting bookings."
                : "Your application is being reviewed."}
            </p>
          </div>
        </div>

        {/* Onboarding timeline */}
        <div className="flex flex-col gap-0">
          {ONBOARDING_TIMELINE.map((step, idx) => (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-5 items-center justify-center rounded-full shrink-0 ${
                    step.done
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <Clock className="size-3" />
                  )}
                </div>
                {idx < ONBOARDING_TIMELINE.length - 1 && (
                  <div
                    className={`w-px min-h-[20px] flex-1 my-0.5 ${
                      step.done ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <p
                className={`pb-4 text-sm ${
                  step.done ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
