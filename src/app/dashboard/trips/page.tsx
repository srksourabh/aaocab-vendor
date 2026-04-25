"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getVendorTrips,
  acceptTrip,
  declineTrip,
  type Booking,
} from "@/lib/vendor";
import { MOCK_DRIVERS, MOCK_VEHICLES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

const DEMO_VENDOR_ID = "vendor-001";

type TabKey = "new" | "active" | "completed" | "all";

const DECLINE_REASONS = [
  "No availability",
  "Vehicle under maintenance",
  "Driver unavailable",
  "Route too far",
  "Other",
];

function TripStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    confirmed: "bg-[#EDEDFB] text-primary",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    new: "New Request",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AcceptDeclineCard({
  trip,
  onAccepted,
  onDeclined,
  labels,
}: {
  trip: Booking;
  onAccepted: (id: string) => void;
  onDeclined: (id: string) => void;
  labels: {
    assignDriver: string;
    assignVehicle: string;
    selectDriver: string;
    selectVehicle: string;
    acceptTrip: string;
    accepting: string;
    decline: string;
    declineReason: string;
    selectReason: string;
    confirmDecline: string;
    declining: string;
    yourPayout: string;
    cancel: string;
  };
}) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [loading, setLoading] = useState(false);

  const activeDrivers = MOCK_DRIVERS.filter((d) => d.status === "active");
  const activeVehicles = MOCK_VEHICLES.filter((v) => v.status === "active");

  async function handleAccept() {
    if (!selectedDriver || !selectedVehicle) return;
    setLoading(true);
    try {
      await acceptTrip(trip.id, selectedDriver, selectedVehicle);
      onAccepted(trip.id);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    if (!declineReason) return;
    setLoading(true);
    try {
      await declineTrip(trip.id, declineReason);
      onDeclined(trip.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-border p-5 flex flex-col gap-4">
      {/* Trip info */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-mono text-muted-foreground">
            {trip.booking_number}
          </p>
          <p className="text-base font-semibold text-foreground mt-0.5">
            {trip.pickup_location}
          </p>
          <p className="text-sm text-muted-foreground">
            to {trip.drop_location}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(trip.pickup_datetime)} &middot; {trip.vehicle_category_name}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <p className="text-lg font-bold text-foreground">
            ₹{formatCurrency(trip.total_fare)}
          </p>
          <p className="text-sm text-accent font-medium">
            {labels.yourPayout}: ₹{formatCurrency(trip.vendor_payout)}
          </p>
        </div>
      </div>

      {/* Assign dropdowns */}
      {!declining && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              {labels.assignDriver}
            </label>
            <div className="relative">
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200 cursor-pointer pr-8"
              >
                <option value="">{labels.selectDriver}</option>
                {activeDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              {labels.assignVehicle}
            </label>
            <div className="relative">
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200 cursor-pointer pr-8"
              >
                <option value="">{labels.selectVehicle}</option>
                {activeVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} — {v.make} {v.model}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Decline reason */}
      {declining && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            {labels.declineReason}
          </label>
          <div className="relative">
            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30 transition-all duration-200 cursor-pointer pr-8"
            >
              <option value="">{labels.selectReason}</option>
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!declining ? (
          <>
            <Button
              onClick={handleAccept}
              disabled={!selectedDriver || !selectedVehicle || loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-[#3D3CB8] transition-all duration-200 cursor-pointer disabled:opacity-50"
              size="sm"
            >
              {loading ? labels.accepting : labels.acceptTrip}
            </Button>
            <Button
              onClick={() => setDeclining(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-destructive text-destructive hover:bg-red-50 transition-all duration-200 cursor-pointer"
            >
              {labels.decline}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleDecline}
              disabled={!declineReason || loading}
              size="sm"
              className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? labels.declining : labels.confirmDecline}
            </Button>
            <Button
              onClick={() => {
                setDeclining(false);
                setDeclineReason("");
              }}
              variant="outline"
              size="sm"
              className="cursor-pointer transition-all duration-200"
            >
              {labels.cancel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, driverLabel, payoutLabel }: { trip: Booking; driverLabel: string; payoutLabel: string }) {
  return (
    <Link
      href={`/dashboard/trips/${trip.id}`}
      className="block rounded-xl bg-white border border-border p-4 hover:bg-muted transition-colors duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-mono text-muted-foreground">
            {trip.booking_number}
          </p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {trip.pickup_location} → {trip.drop_location}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(trip.pickup_datetime)} &middot; {trip.vehicle_category_name}
          </p>
          {trip.assigned_driver_name && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {driverLabel}: {trip.assigned_driver_name}
            </p>
          )}
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
          <TripStatusBadge status={trip.status} />
          <p className="text-sm font-semibold text-foreground">
            ₹{formatCurrency(trip.total_fare)}
          </p>
          <p className="text-xs text-accent">
            {payoutLabel}: ₹{formatCurrency(trip.vendor_payout)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function TripsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [allTrips, setAllTrips] = useState<Booking[]>([]);
  const [handledIds, setHandledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getVendorTrips(DEMO_VENDOR_ID).then(setAllTrips);
  }, []);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "new", label: t("newRequests") },
    { key: "active", label: t("activeTrips") },
    { key: "completed", label: t("completedTrips") },
    { key: "all", label: t("allTrips") },
  ];

  const cardLabels = {
    assignDriver: t("assignDriver"),
    assignVehicle: t("assignVehicle"),
    selectDriver: t("selectDriver"),
    selectVehicle: t("selectVehicle"),
    acceptTrip: t("acceptTrip"),
    accepting: t("accepting"),
    decline: t("decline"),
    declineReason: t("declineReason"),
    selectReason: t("selectReason"),
    confirmDecline: t("confirmDecline"),
    declining: t("declining"),
    yourPayout: t("yourPayout"),
    cancel: t("cancel"),
  };

  function filterTrips(tab: TabKey): Booking[] {
    const remaining = allTrips.filter((t) => !handledIds.has(t.id));
    if (tab === "all") return remaining;
    if (tab === "new") return remaining.filter((t) => t.status === "new");
    if (tab === "active")
      return remaining.filter((t) =>
        ["confirmed", "in_progress"].includes(t.status)
      );
    if (tab === "completed")
      return remaining.filter((t) =>
        ["completed", "cancelled"].includes(t.status)
      );
    return remaining;
  }

  function handleAccepted(id: string) {
    setHandledIds((prev) => new Set([...prev, id]));
  }

  function handleDeclined(id: string) {
    setHandledIds((prev) => new Set([...prev, id]));
  }

  const visibleTrips = filterTrips(activeTab);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-bold text-foreground">
        {t("tripManagement")}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-border p-1 w-full sm:w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.key === "new" &&
              filterTrips("new").length > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-600 text-white text-[10px] px-1.5 py-0.5">
                  {filterTrips("new").length}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Trip list */}
      <div className="flex flex-col gap-3">
        {visibleTrips.length === 0 && (
          <p className="text-sm text-muted-foreground py-12 text-center">
            {t("noTripsInCategory")}
          </p>
        )}

        {activeTab === "new"
          ? visibleTrips.map((trip) => (
              <AcceptDeclineCard
                key={trip.id}
                trip={trip}
                onAccepted={handleAccepted}
                onDeclined={handleDeclined}
                labels={cardLabels}
              />
            ))
          : visibleTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                driverLabel={t("driver")}
                payoutLabel={t("yourPayout")}
              />
            ))}
      </div>
    </div>
  );
}
