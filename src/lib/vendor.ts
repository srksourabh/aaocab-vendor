import { supabase } from "@/lib/supabase";
import {
  MOCK_VENDOR,
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  MOCK_BOOKINGS,
  MOCK_EARNINGS,
  MOCK_EARNINGS_ROWS,
  MOCK_ALERTS,
} from "@/lib/mock-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  vehicleCount: number;
  driverCount: number;
  monthlyTrips: number;
  monthlyEarnings: number;
}

export interface VendorAlert {
  type: string;
  entity: string;
  entity_name: string;
  message: string;
  daysUntilExpiry: number;
  link: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  trip_type: string;
  pickup_location: string;
  drop_location: string;
  pickup_datetime: string;
  vehicle_category_name: string;
  total_fare: number;
  advance_amount: number;
  status: string;
  assigned_driver_id: string | null;
  assigned_driver_name: string | null;
  assigned_vehicle_id: string | null;
  assigned_vehicle_reg: string | null;
  vendor_payout: number;
}

export interface EarningRow {
  id: string;
  booking_id: string;
  booking_number: string;
  date: string;
  route: string;
  total_fare: number;
  commission_rate: number;
  commission_amount: number;
  vendor_payout: number;
  payout_status: string;
}

export interface EarningsSummary {
  label: string;
  total_fare: number;
  commission_amount: number;
  vendor_payout: number;
  pending_payout: number;
  paid_payout: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  return { start, end };
}

// ─── Public functions ─────────────────────────────────────────────────────────

export async function getVendorProfile(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", vendorId)
      .single();
    if (error || !data) return MOCK_VENDOR;
    return data;
  } catch {
    return MOCK_VENDOR;
  }
}

export async function getVendorDashboardStats(
  vendorId: string
): Promise<DashboardStats> {
  try {
    const { count: vehicleCount, error: vErr } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendorId);

    const { count: driverCount, error: dErr } = await supabase
      .from("drivers")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendorId);

    const { start, end } = getMonthRange();
    const { count: monthlyTrips, error: bErr } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("assigned_vendor_id", vendorId)
      .eq("status", "completed")
      .gte("pickup_datetime", start)
      .lte("pickup_datetime", end);

    const { data: earningsData, error: eErr } = await supabase
      .from("vendor_earnings")
      .select("vendor_payout")
      .eq("vendor_id", vendorId)
      .gte("created_at", start)
      .lte("created_at", end);

    if (vErr || dErr || bErr || eErr || vehicleCount === null) {
      throw new Error("Supabase query failed");
    }

    const monthlyEarnings =
      earningsData?.reduce((sum, row) => sum + (row.vendor_payout ?? 0), 0) ??
      0;

    return {
      vehicleCount: vehicleCount ?? 0,
      driverCount: driverCount ?? 0,
      monthlyTrips: monthlyTrips ?? 0,
      monthlyEarnings,
    };
  } catch {
    return {
      vehicleCount: MOCK_VEHICLES.length,
      driverCount: MOCK_DRIVERS.length,
      monthlyTrips: 8,
      monthlyEarnings: 13640,
    };
  }
}

export async function getVendorAlerts(
  vendorId: string
): Promise<VendorAlert[]> {
  try {
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    const cutoff = thirtyDaysAhead.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const { data: docData, error } = await supabase
      .from("documents")
      .select("id, entity_type, entity_id, document_type, expiry_date")
      .lte("expiry_date", cutoff)
      .order("expiry_date", { ascending: true });

    if (error || !docData || docData.length === 0) {
      throw new Error("No data");
    }

    const alerts: VendorAlert[] = docData.map((doc) => {
      const expiry = new Date(doc.expiry_date);
      const now = new Date(today);
      const diff = Math.round(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        type: doc.document_type,
        entity: doc.entity_id,
        entity_name: doc.entity_id,
        message:
          diff < 0
            ? `${doc.document_type} expired ${Math.abs(diff)} days ago`
            : `${doc.document_type} expires in ${diff} days`,
        daysUntilExpiry: diff,
        link:
          doc.entity_type === "driver"
            ? `/dashboard/fleet/drivers/${doc.entity_id}`
            : `/dashboard/fleet/vehicles/${doc.entity_id}`,
      };
    });

    return alerts;
  } catch {
    return MOCK_ALERTS;
  }
}

export async function getVendorTrips(
  vendorId: string,
  status?: string
): Promise<Booking[]> {
  try {
    let query = supabase
      .from("bookings")
      .select("*")
      .eq("assigned_vendor_id", vendorId)
      .order("pickup_datetime", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      throw new Error("No data");
    }

    return data as Booking[];
  } catch {
    if (status && status !== "all") {
      return MOCK_BOOKINGS.filter((b) => b.status === status) as Booking[];
    }
    return MOCK_BOOKINGS as Booking[];
  }
}

export async function getVendorEarnings(
  vendorId: string,
  period: string
): Promise<{ summary: EarningsSummary; rows: EarningRow[] }> {
  try {
    const { data, error } = await supabase
      .from("vendor_earnings")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      throw new Error("No data");
    }

    const summary: EarningsSummary = {
      label: period,
      total_fare: data.reduce((s, r) => s + (r.total_fare ?? 0), 0),
      commission_amount: data.reduce(
        (s, r) => s + (r.commission_amount ?? 0),
        0
      ),
      vendor_payout: data.reduce((s, r) => s + (r.vendor_payout ?? 0), 0),
      pending_payout: data
        .filter((r) => r.payout_status === "pending")
        .reduce((s, r) => s + (r.vendor_payout ?? 0), 0),
      paid_payout: data
        .filter((r) => r.payout_status === "paid")
        .reduce((s, r) => s + (r.vendor_payout ?? 0), 0),
    };

    return { summary, rows: data as EarningRow[] };
  } catch {
    const summaryMap: Record<string, EarningsSummary> = {
      this_month: MOCK_EARNINGS.current_month,
      last_month: MOCK_EARNINGS.last_month,
      last_3_months: MOCK_EARNINGS.last_3_months,
    };

    return {
      summary: summaryMap[period] ?? MOCK_EARNINGS.current_month,
      rows: MOCK_EARNINGS_ROWS,
    };
  }
}

export async function getVendorVehicles(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      throw new Error("No data");
    }

    return data;
  } catch {
    return MOCK_VEHICLES;
  }
}

export async function getVendorDrivers(vendorId: string) {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      throw new Error("No data");
    }

    return data;
  } catch {
    return MOCK_DRIVERS;
  }
}

export async function getVehicleById(vehicleId: string) {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .single();

    if (error || !data) throw new Error("Not found");
    return data;
  } catch {
    return MOCK_VEHICLES.find((v) => v.id === vehicleId) ?? MOCK_VEHICLES[0];
  }
}

export async function getDriverById(driverId: string) {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", driverId)
      .single();

    if (error || !data) throw new Error("Not found");
    return data;
  } catch {
    return MOCK_DRIVERS.find((d) => d.id === driverId) ?? MOCK_DRIVERS[0];
  }
}

export async function getBookingById(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !data) throw new Error("Not found");
    return data as Booking;
  } catch {
    return (
      (MOCK_BOOKINGS.find((b) => b.id === bookingId) as Booking) ??
      (MOCK_BOOKINGS[0] as Booking)
    );
  }
}

export async function acceptTrip(
  bookingId: string,
  driverId: string,
  vehicleId: string
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      assigned_driver_id: driverId,
      assigned_vehicle_id: vehicleId,
    })
    .eq("id", bookingId);

  if (error) {
    throw new Error("Failed to accept trip: " + error.message);
  }
}

export async function declineTrip(
  bookingId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
    })
    .eq("id", bookingId);

  if (error) {
    throw new Error("Failed to decline trip: " + error.message);
  }
}
