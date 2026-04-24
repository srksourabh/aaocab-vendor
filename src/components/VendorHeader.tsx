"use client";

import { Phone } from "lucide-react";
import Link from "next/link";

interface VendorHeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
}

export default function VendorHeader({
  isLoggedIn = false,
  userName,
}: VendorHeaderProps) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span
            className="font-heading text-xl font-bold"
            style={{ color: "#4F4ED6" }}
          >
            AaoCab
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Vendor Portal
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Help link */}
          <a
            href="tel:7890302302"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer"
            aria-label="Call support at 7890302302"
          >
            <Phone className="size-4" />
            <span className="hidden sm:inline">7890302302</span>
          </a>

          {/* Profile avatar — only when logged in */}
          {isLoggedIn && (
            <div
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90"
              aria-label={`Profile: ${userName}`}
              role="button"
              tabIndex={0}
            >
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
