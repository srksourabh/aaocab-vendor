import {
  getVendorDashboardStats,
  getVendorAlerts,
  getVendorTrips,
  getVendorEarnings,
} from "@/lib/vendor";
import { MOCK_VENDOR } from "@/lib/mock-data";
import DashboardContent from "./DashboardContent";

const DEMO_VENDOR_ID = "vendor-001";

export default async function DashboardPage() {
  const [stats, alerts, recentTrips, earningsData] = await Promise.all([
    getVendorDashboardStats(DEMO_VENDOR_ID),
    getVendorAlerts(DEMO_VENDOR_ID),
    getVendorTrips(DEMO_VENDOR_ID),
    getVendorEarnings(DEMO_VENDOR_ID, "this_month"),
  ]);

  const latestTrips = recentTrips.slice(0, 5);
  const { summary } = earningsData;

  return (
    <DashboardContent
      stats={stats}
      alerts={alerts}
      latestTrips={latestTrips}
      summary={summary}
      vendor={MOCK_VENDOR}
    />
  );
}
