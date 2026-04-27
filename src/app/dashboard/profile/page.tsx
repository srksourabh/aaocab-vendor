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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t } = useLanguage();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  const ONBOARDING_TIMELINE = [
    { key: "phone_verified", label: t("phoneVerified"), done: true },
    { key: "profile_completed", label: t("profileCompleted"), done: true },
    { key: "documents_uploaded", label: t("documentsUploaded"), done: true },
    { key: "vehicles_added", label: t("vehiclesAdded"), done: true },
    { key: "under_review", label: t("underReviewStep"), done: true },
    {
      key: "active",
      label: t("accountActivatedStep"),
      done: MOCK_VENDOR.onboarding_status === "active",
    },
  ];

  const statusLabel =
    MOCK_VENDOR.onboarding_status === "active"
      ? t("active")
      : MOCK_VENDOR.onboarding_status === "under_review"
      ? t("underReview")
      : MOCK_VENDOR.onboarding_status;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="font-heading text-xl font-bold text-foreground">
        {t("profile")}
      </h1>

      {/* Business profile card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            {t("businessProfile")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
          >
            <Edit className="size-3.5" />
            {editingProfile ? t("cancel") : t("editProfile")}
          </Button>
        </div>

        {editingProfile ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("businessName")}
              </label>
              <input
                type="text"
                defaultValue={MOCK_VENDOR.business_name}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("ownerName")}
              </label>
              <input
                type="text"
                defaultValue={MOCK_VENDOR.owner_name}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("city")}
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
              {t("saveChanges")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InfoRow
              icon={Building2}
              label={t("businessName")}
              value={MOCK_VENDOR.business_name}
            />
            <InfoRow
              icon={User}
              label={t("ownerName")}
              value={MOCK_VENDOR.owner_name}
            />
            <InfoRow
              icon={Phone}
              label={t("mobileNumberLabel")}
              value={`+91 ${MOCK_VENDOR.phone}`}
            />
            <InfoRow icon={MapPin} label={t("city")} value={MOCK_VENDOR.city} />
            <InfoRow
              icon={Car}
              label={t("selfDriverLabel")}
              value={MOCK_VENDOR.is_self_driver ? t("yes") : t("no")}
            />
          </div>
        )}
      </div>

      {/* Bank details card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            {t("bankDetails")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingBank(!editingBank)}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
          >
            <Edit className="size-3.5" />
            {editingBank ? t("cancel") : t("update")}
          </Button>
        </div>

        {editingBank ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("accountNumber")}
              </label>
              <input
                type="text"
                placeholder={t("enterAccountNumber")}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("ifscCode")}
              </label>
              <input
                type="text"
                defaultValue={DEMO_BANK.ifsc}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                {t("accountHolder")}
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
              {t("saveBankDetails")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <InfoRow
              icon={CreditCard}
              label={t("accountNumber")}
              value={DEMO_BANK.account_number}
            />
            <InfoRow
              icon={FileText}
              label={t("ifscCode")}
              value={DEMO_BANK.ifsc}
            />
            <InfoRow
              icon={User}
              label={t("accountHolder")}
              value={DEMO_BANK.holder_name}
            />
          </div>
        )}
      </div>

      {/* Agreement & status card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <h2 className="font-heading text-base font-semibold text-foreground mb-5">
          {t("accountStatus")}
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
                ? t("accountActivated")
                : t("applicationUnderReview")}
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
