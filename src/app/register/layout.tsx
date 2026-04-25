import VendorHeader from "@/components/VendorHeader";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <VendorHeader />
      <OfflineIndicator />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
