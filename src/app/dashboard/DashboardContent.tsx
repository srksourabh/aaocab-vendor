"use client";

import Link from "next/link";
import {
  Car,
  Users,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { DashboardStats, VendorAlert, Booking, EarningsSummary } from "@/lib/vendor";
import { MOCK_VENDOR } from "@/lib/mock-data";

type VendorData = typeof MOCK_VENDOR;

function StatusBadge({ status, labels }: {
  status: string;
  labels: { active: string; underReview: string; suspended: string; pending: string };
}) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: labels.active, cls: "bg-green-100 text-green-700" },
    under_review: { label: labels.underReview, cls: "bg-yellow-100 text-yellow-700" },
    suspended: { label: labels.suspended, cls: "bg-red-100 text-red-700" },
    pending: { label: labels.pending, cls: "bg-gray-100 text-gray-600" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "New Request", cls: "bg-blue-100 text-blue-700" },
    confirmed: { label: "Confirmed", cls: "bg-[#EDEDFB] text-primary" },
    in_progress: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700" },
    completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardContent({
  stats,
  alerts,
  latestTrips,
  summary,
  vendor,
}: {
  stats: DashboardStats;
  alerts: VendorAlert[];
  latestTrips: Booking[];
  summary: EarningsSummary;
  vendor: VendorData;
}) {
  const { t } = useLanguage();

  const statusLabels = {
    active: t("active"),
    underReview: t("underReview"),
    suspended: t("suspended"),
    pending: t("pending"),
  };

  const statCards = [
    {
      label: t("vehicles"),
      value: stats.vehicleCount,
      icon: Car,
      color: "bg-[#EDEDFB] text-primary",
    },
    {
      label: t("drivers"),
      value: stats.driverCount,
      icon: Users,
      color: "bg-[#E6F7F5] text-accent",
    },
    {
      label: t("tripsThisMonth"),
      value: stats.monthlyTrips,
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-white border border-border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
            {t("dashboardWelcome")}, {vendor.business_name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("vendorId")}: <span className="font-mono font-medium">{vendor.id}</span>
          </p>
        </div>
        <StatusBadge status={vendor.onboarding_status} labels={statusLabels} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl bg-white border border-border p-6 flex items-center gap-4"
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${card.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="font-heading text-2xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section>
          <h2 className="font-heading text-base font-semibold text-foreground mb-3">
            {t("alerts")}
          </h2>
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <Link
                key={`${alert.entity}-${alert.type}`}
                href={alert.link}
                className="flex items-start gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors duration-200 cursor-pointer"
              >
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {alert.entity_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <span className="text-xs font-medium text-primary shrink-0">
                  {t("renewNow")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent trips */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-base font-semibold text-foreground">
              {t("recentTrips")}
            </h2>
            <Link
              href="/dashboard/trips"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200"
            >
              {t("viewAll")}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="rounded-xl bg-white border border-border overflow-hidden">
            {latestTrips.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                {t("noTripsYet")}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {latestTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/dashboard/trips/${trip.id}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3.5 hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">
                        {trip.booking_number}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {trip.pickup_location} → {trip.drop_location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(trip.pickup_datetime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <TripStatusBadge status={trip.status} />
                      <p className="text-sm font-semibold text-foreground">
                        ₹{formatCurrency(trip.total_fare)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Earnings summary */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-base font-semibold text-foreground">
              {t("earningsThisMonth")}
            </h2>
            <Link
              href="/dashboard/earnings"
              className="text-sm font-medium text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200"
            >
              {t("details")}
            </Link>
          </div>
          <div className="rounded-xl bg-white border border-border p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6F7F5] text-accent">
                <IndianRupee className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("netPayout")}</p>
                <p className="font-heading text-2xl font-bold text-accent">
                  ₹{formatCurrency(summary.vendor_payout)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("totalFare")}</span>
                <span className="font-medium">₹{formatCurrency(summary.total_fare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("commission")}</span>
                <span className="font-medium text-destructive">
                  -₹{formatCurrency(summary.commission_amount)}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("pendingAmount")}</span>
                <span className="font-medium text-amber-600">
                  ₹{formatCurrency(summary.pending_payout)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("paidAmount")}</span>
                <span className="font-medium text-green-600">
                  ₹{formatCurrency(summary.paid_payout)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
