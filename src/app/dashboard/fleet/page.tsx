"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Users,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVendorVehicles, getVendorDrivers } from "@/lib/vendor";
import { MOCK_VEHICLES, MOCK_DRIVERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DEMO_VENDOR_ID = "vendor-001";

type VehicleStatus = "active" | "expiring" | "suspended";

function getVehicleStatus(vehicle: typeof MOCK_VEHICLES[number]): VehicleStatus {
  if (vehicle.status === "suspended") return "suspended";
  const today = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(today.getDate() + 30);
  const dates = [
    new Date(vehicle.insurance_expiry),
    new Date(vehicle.fitness_expiry),
    new Date(vehicle.puc_expiry),
  ];
  const hasExpiring = dates.some((d) => d <= thirtyDays);
  if (hasExpiring) return "expiring";
  return "active";
}

function StatusDot({ status }: { status: VehicleStatus | string }) {
  const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    active: {
      cls: "text-green-600",
      label: "Active",
      icon: <CheckCircle2 className="size-3.5" />,
    },
    expiring: {
      cls: "text-amber-500",
      label: "Expiring Soon",
      icon: <AlertTriangle className="size-3.5" />,
    },
    suspended: {
      cls: "text-destructive",
      label: "Suspended",
      icon: <XCircle className="size-3.5" />,
    },
    inactive: {
      cls: "text-muted-foreground",
      label: "Inactive",
      icon: <XCircle className="size-3.5" />,
    },
  };
  const { cls, label, icon } = map[status] ?? map.inactive;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  );
}

function VehicleCard({ vehicle }: { vehicle: typeof MOCK_VEHICLES[number] }) {
  const vstatus = getVehicleStatus(vehicle);
  return (
    <div className="rounded-xl bg-white border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-heading text-base font-bold text-foreground">
            {vehicle.registration_number}
          </p>
          <p className="text-xs text-muted-foreground">
            {vehicle.category_name} &middot; {vehicle.make} {vehicle.model} ({vehicle.year})
          </p>
        </div>
        <StatusDot status={vstatus} />
      </div>

      {vehicle.condition_score != null && (
        <p className="text-sm text-muted-foreground">
          Condition:{" "}
          <span className="font-medium text-foreground">
            {vehicle.condition_score}/10
          </span>
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        Documents:{" "}
        <span className="font-medium text-foreground">
          {vehicle.docs_verified}/{vehicle.docs_total} verified
        </span>
      </p>

      <Link href={`/dashboard/fleet/vehicles/${vehicle.id}`}>
        <Button
          variant="outline"
          size="sm"
          className="w-full cursor-pointer transition-all duration-200"
        >
          Manage
        </Button>
      </Link>
    </div>
  );
}

function DriverCard({ driver }: { driver: typeof MOCK_DRIVERS[number] }) {
  return (
    <div className="rounded-xl bg-white border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-heading text-base font-bold text-foreground">
            {driver.name}
          </p>
          <p className="text-xs text-muted-foreground">{driver.phone}</p>
        </div>
        <StatusDot status={driver.status} />
      </div>

      <div className="flex items-center gap-1.5">
        <Star className="size-3.5 text-amber-400 fill-amber-400" />
        <span className="text-sm font-medium text-foreground">
          {driver.overall_rating}
        </span>
        <span className="text-xs text-muted-foreground">
          ({driver.total_trips} trips)
        </span>
      </div>

      {driver.assigned_vehicles.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Assigned: {driver.assigned_vehicles.join(", ")}
        </p>
      )}

      <Link href={`/dashboard/fleet/drivers/${driver.id}`}>
        <Button
          variant="outline"
          size="sm"
          className="w-full cursor-pointer transition-all duration-200"
        >
          Manage
        </Button>
      </Link>
    </div>
  );
}

type Tab = "vehicles" | "drivers";

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("vehicles");
  const [vehicles, setVehicles] = useState<typeof MOCK_VEHICLES>([]);
  const [drivers, setDrivers] = useState<typeof MOCK_DRIVERS>([]);

  useEffect(() => {
    getVendorVehicles(DEMO_VENDOR_ID).then((v) =>
      setVehicles(v as typeof MOCK_VEHICLES)
    );
    getVendorDrivers(DEMO_VENDOR_ID).then((d) =>
      setDrivers(d as typeof MOCK_DRIVERS)
    );
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Fleet Management
        </h1>
        <Button
          className="bg-primary text-primary-foreground hover:bg-[#3D3CB8] transition-all duration-200 cursor-pointer"
          size="sm"
        >
          <Plus className="size-4" />
          {activeTab === "vehicles" ? "Add Vehicle" : "Add Driver"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-border p-1 w-fit">
        {(["vehicles", "drivers"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "vehicles" ? (
              <Car className="size-4" />
            ) : (
              <Users className="size-4" />
            )}
            {tab === "vehicles" ? "Vehicles" : "Drivers"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "vehicles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
          {vehicles.length === 0 && (
            <p className="col-span-2 text-center text-sm text-muted-foreground py-12">
              No vehicles added yet.
            </p>
          )}
        </div>
      )}

      {activeTab === "drivers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
          {drivers.length === 0 && (
            <p className="col-span-2 text-center text-sm text-muted-foreground py-12">
              No drivers added yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
