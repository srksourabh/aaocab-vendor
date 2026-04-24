import { getDriverById } from "@/lib/vendor";
import { MOCK_BOOKINGS, MOCK_VEHICLES } from "@/lib/mock-data";
import { CheckCircle2, AlertTriangle, XCircle, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function DocStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    passed: {
      label: "Verified",
      cls: "bg-green-100 text-green-700",
      icon: <CheckCircle2 className="size-3" />,
    },
    flagged: {
      label: "Flagged",
      cls: "bg-yellow-100 text-yellow-700",
      icon: <AlertTriangle className="size-3" />,
    },
    rejected: {
      label: "Rejected",
      cls: "bg-red-100 text-red-700",
      icon: <XCircle className="size-3" />,
    },
    expired: {
      label: "Expired",
      cls: "bg-red-100 text-red-700",
      icon: <XCircle className="size-3" />,
    },
    pending: {
      label: "Pending",
      cls: "bg-gray-100 text-gray-600",
      icon: null,
    },
  };
  const { label, cls, icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    confirmed: "bg-[#EDEDFB] text-primary",
    new: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

const DEMO_DRIVER_DOCS = [
  { label: "Driving License", type: "license", status: "passed", expiry: "2027-03-12" },
  { label: "Aadhaar Card", type: "aadhaar", status: "passed", expiry: null },
  { label: "Police Verification", type: "police", status: "flagged", expiry: null },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getDriverById(id);

  const d = driver as {
    id?: string;
    name?: string;
    phone?: string;
    license_expiry?: string;
    status?: string;
    overall_rating?: number;
    total_trips?: number;
    on_time_percentage?: number;
    assigned_vehicles?: string[];
  };

  // Filter trips for this driver from mock data
  const driverTrips = MOCK_BOOKINGS.filter(
    (b) => b.assigned_driver_id === (d.id ?? id)
  ).slice(0, 10);

  // Find assigned vehicles
  const assignedVehicles = MOCK_VEHICLES.filter((v) =>
    (d.assigned_vehicles ?? []).includes(v.registration_number)
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/dashboard/fleet"
        className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200 w-fit"
      >
        ← Back to Fleet
      </Link>

      {/* Driver info card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {d.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{d.phone}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                d.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {d.status === "active" ? "Active" : "Inactive"}
            </span>
            {d.overall_rating != null && (
              <div className="flex items-center gap-1">
                <Star className="size-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{d.overall_rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({d.total_trips} trips)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">License Expiry</p>
            <p className="font-medium">{d.license_expiry ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">On-Time Rate</p>
            <p className="font-medium">{d.on_time_percentage ?? "—"}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Total Trips</p>
            <p className="font-medium">{d.total_trips ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Documents
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
          >
            <Upload className="size-3.5" />
            Upload New
          </Button>
        </div>
        <div className="rounded-xl bg-white border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {DEMO_DRIVER_DOCS.map((doc) => (
              <div
                key={doc.type}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {doc.label}
                  </p>
                  {doc.expiry && (
                    <p className="text-xs text-muted-foreground">
                      Expiry: {doc.expiry}
                    </p>
                  )}
                </div>
                <DocStatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assigned vehicles */}
      <section>
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">
          Assigned Vehicles
        </h2>
        {assignedVehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vehicles assigned.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {assignedVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/dashboard/fleet/vehicles/${vehicle.id}`}
                className="flex items-center justify-between rounded-xl bg-white border border-border px-4 py-3 hover:bg-muted transition-colors duration-200 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {vehicle.registration_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                </div>
                <span className="text-xs text-primary font-medium">View</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trip history */}
      <section>
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">
          Recent Trips
        </h2>
        {driverTrips.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trips recorded.</p>
        ) : (
          <div className="rounded-xl bg-white border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {driverTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/dashboard/trips/${trip.id}`}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-colors duration-200 cursor-pointer"
                >
                  <div className="min-w-0">
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
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <TripStatusBadge status={trip.status} />
                    <p className="text-sm font-semibold">
                      ₹{formatCurrency(trip.total_fare)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
