import { getVehicleById } from "@/lib/vendor";
import { MOCK_DRIVERS } from "@/lib/mock-data";
import { CheckCircle2, AlertTriangle, XCircle, Upload } from "lucide-react";
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

// Static demo documents for a vehicle — in production these come from documents table
const DEMO_DOCS = [
  { label: "Registration Certificate", type: "RC", status: "passed", expiry: "2030-06-01" },
  { label: "Insurance Policy", type: "Insurance", status: "passed", expiry: "2025-08-15" },
  { label: "Fitness Certificate", type: "Fitness", status: "passed", expiry: "2025-11-20" },
  { label: "PUC Certificate", type: "PUC", status: "flagged", expiry: "2025-05-10" },
  { label: "Permit", type: "Permit", status: "pending", expiry: null },
];

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  // Find assigned drivers from mock data
  const assignedDrivers = MOCK_DRIVERS.filter(
    (d) =>
      "assigned_vehicles" in d &&
      Array.isArray(d.assigned_vehicles) &&
      d.assigned_vehicles.includes(
        (vehicle as { registration_number?: string }).registration_number ?? ""
      )
  );

  const v = vehicle as {
    registration_number?: string;
    make?: string;
    model?: string;
    year?: number;
    category_name?: string;
    condition_score?: number;
    status?: string;
    insurance_expiry?: string;
    fitness_expiry?: string;
    puc_expiry?: string;
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/dashboard/fleet"
        className="text-sm text-primary hover:underline underline-offset-4 cursor-pointer transition-all duration-200 w-fit"
      >
        ← Back to Fleet
      </Link>

      {/* Vehicle info card */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {v.registration_number}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {v.category_name} &middot; {v.make} {v.model} &middot; {v.year}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {v.condition_score != null && (
              <span className="text-sm font-medium text-foreground">
                Condition: {v.condition_score}/10
              </span>
            )}
            <span
              className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                v.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {v.status === "active" ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Insurance Expiry</p>
            <p className="font-medium">{v.insurance_expiry ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Fitness Expiry</p>
            <p className="font-medium">{v.fitness_expiry ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">PUC Expiry</p>
            <p className="font-medium">{v.puc_expiry ?? "—"}</p>
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
            {DEMO_DOCS.map((doc) => (
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

      {/* Assigned drivers */}
      <section>
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">
          Assigned Drivers
        </h2>
        {assignedDrivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No drivers assigned to this vehicle.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {assignedDrivers.map((driver) => (
              <Link
                key={driver.id}
                href={`/dashboard/fleet/drivers/${driver.id}`}
                className="flex items-center justify-between rounded-xl bg-white border border-border px-4 py-3 hover:bg-muted transition-colors duration-200 cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {driver.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{driver.phone}</p>
                </div>
                <span className="text-xs text-primary font-medium">View</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
