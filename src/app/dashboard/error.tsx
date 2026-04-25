"use client";

import Link from "next/link";
import { Phone, Home } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm flex flex-col items-center text-center gap-5">
        {/* Icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-red-50">
          <svg
            viewBox="0 0 24 24"
            className="size-8 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">
            {t("somethingWentWrong")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("errorDesc")}
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={unstable_retry}
            className="h-12 w-full rounded-[40px] bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/dashboard"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] border border-border text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            <Home className="size-4" />
            {t("goToDashboard")}
          </Link>
          <a
            href="tel:7890302302"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] border border-border text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary cursor-pointer"
          >
            <Phone className="size-4" />
            {t("callSupport")}
          </a>
        </div>
      </div>
    </div>
  );
}
