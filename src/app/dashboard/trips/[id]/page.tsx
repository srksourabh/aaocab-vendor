import { getBookingById, getDriverById, getVehicleById } from "@/lib/vendor";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Car,
  User,
  IndianRupee,
  CheckCircle2,
  Clock,
} from "lucide-react";

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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_TIMELINE = [
  { key: "new", label: "Booking Received", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "in_progress", label: "Trip Started", icon: Car },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const STATUS_ORDER = ["new", "confirmed", "in_progress", "completed"];

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  const b = booking as {
    id?: string;
    booking_number?: string;
    trip_type?: string;
    pickup_location?: string;
    drop_location?: string;
    pickup_datetime?: string;
    vehicle_category_name?: string;
    total_fare?: number;
    advance_amount?: number;
    status?: string;
    assigned_driver_id?: string | null;
    assigned_driver_name?: string | null;
    assigned_vehicle_id?: string | null;
    assigned_vehicle_reg?: string | null;
    vendor_payout?: number;
  };

  const driver =
    b.assigned_driver_id
      ? await getDriverById(b.assigned_driver_id)
      : null;

  const vehicle =
    b.assigned_vehicle_id
      ? await getVehicleById(b.assigned_vehicle_id)
      : null;

  const currentStatusIndex = STATUS_ORDER.indexOf(b.status ?? "new");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back */}
      <Link
        href="/dashboard/trips"
        className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200 w-fit"
      >
        ← Back to Trips
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono text-muted-foreground">
            {b.booking_number}
          </p>
          <h1 className="font-heading text-xl font-bold text-foreground mt-1">
            Trip Details
          </h1>
        </div>
        <TripStatusBadge status={b.status ?? "new"} />
      </div>

      {/* Route card */}
      <div className="rounded-2xl bg-white border border-border p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-[#EDEDFB]">
              <MapPin className="size-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium text-foreground">
                {b.pickup_location}
              </p>
            </div>
          </div>
          <div className="ml-3.5 w-px h-4 bg-border" />
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-[#E6F7F5]">
              <MapPin className="size-3.5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Drop</p>
              <p className="text-sm font-medium text-foreground">
                {b.drop_location}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="font-medium text-xs">
                {b.pickup_datetime ? formatDate(b.pickup_datetime) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Car className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium">{b.vehicle_category_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <IndianRupee className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Fare</p>
              <p className="font-medium">
                ₹{formatCurrency(b.total_fare ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Payout */}
        <div className="flex items-center justify-between rounded-xl bg-[#E6F7F5] px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            Your Payout
          </span>
          <span className="font-heading text-lg font-bold text-accent">
            ₹{formatCurrency(b.vendor_payout ?? 0)}
          </span>
        </div>
      </div>

      {/* Driver & Vehicle */}
      {(driver || vehicle) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {driver && (
            <div className="rounded-xl bg-white border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Driver
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {(driver as { name?: string }).name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(driver as { phone?: string }).phone}
              </p>
              <Link
                href={`/dashboard/fleet/drivers/${b.assigned_driver_id}`}
                className="mt-2 text-xs text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200 block"
              >
                View profile
              </Link>
            </div>
          )}

          {vehicle && (
            <div className="rounded-xl bg-white border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Car className="size-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Vehicle
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {(vehicle as { registration_number?: string }).registration_number}
              </p>
              <p className="text-xs text-muted-foreground">
                {(vehicle as { make?: string; model?: string; year?: number }).make}{" "}
                {(vehicle as { make?: string; model?: string; year?: number }).model}{" "}
                ({(vehicle as { make?: string; model?: string; year?: number }).year})
              </p>
              <Link
                href={`/dashboard/fleet/vehicles/${b.assigned_vehicle_id}`}
                className="mt-2 text-xs text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200 block"
              >
                View vehicle
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Status timeline */}
      {b.status !== "cancelled" && (
        <section>
          <h2 className="font-heading text-base font-semibold text-foreground mb-4">
            Trip Timeline
          </h2>
          <div className="relative flex flex-col gap-0">
            {STATUS_TIMELINE.map((step, idx) => {
              const isDone = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full transition-colors ${
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    {idx < STATUS_TIMELINE.length - 1 && (
                      <div
                        className={`w-px flex-1 min-h-[28px] mt-0.5 ${
                          isDone && idx < currentStatusIndex
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-5">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-primary"
                          : isDone
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pre-trip photos notice */}
      {b.status === "confirmed" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Pre-trip photos required
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Please upload 7 mandatory vehicle photos at least 2 hours before
            pickup. Go to Fleet to manage vehicle photos.
          </p>
        </div>
      )}
    </div>
  );
}
