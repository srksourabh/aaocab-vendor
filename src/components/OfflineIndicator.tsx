"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { processUploadQueue } from "@/lib/offline-storage";
import { useLanguage } from "@/lib/i18n/context";

type BannerState = "hidden" | "offline" | "back-online";

export default function OfflineIndicator() {
  const { t } = useLanguage();
  const [banner, setBanner] = useState<BannerState>("hidden");

  useEffect(() => {
    // Set initial state without flashing on SSR
    if (!navigator.onLine) {
      setBanner("offline");
    }

    function handleOffline() {
      setBanner("offline");
    }

    async function handleOnline() {
      setBanner("back-online");
      await processUploadQueue();
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => setBanner("hidden"), 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (banner === "hidden") return null;

  if (banner === "back-online") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-16 inset-x-0 z-50 flex items-center justify-center gap-2 bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
      >
        <Wifi className="size-4 shrink-0" />
        <span>{t("backOnline")}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-16 inset-x-0 z-50 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2.5 text-sm font-medium text-amber-900 shadow-sm"
    >
      <WifiOff className="size-4 shrink-0" />
      <span>{t("offlineBanner")}</span>
    </div>
  );
}
