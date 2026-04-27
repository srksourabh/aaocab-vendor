"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Car,
  ClipboardList,
  IndianRupee,
  User,
} from "lucide-react";
import VendorHeader from "@/components/VendorHeader";
import OfflineIndicator from "@/components/OfflineIndicator";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

type NavKey = "dashboard" | "fleet" | "trips" | "earnings" | "profile";

const NAV_HREFS: { key: NavKey; href: string; icon: React.ElementType }[] = [
  { key: "dashboard", href: "/dashboard", icon: Home },
  { key: "fleet", href: "/dashboard/fleet", icon: Car },
  { key: "trips", href: "/dashboard/trips", icon: ClipboardList },
  { key: "earnings", href: "/dashboard/earnings", icon: IndianRupee },
  { key: "profile", href: "/dashboard/profile", icon: User },
];

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer",
        isActive
          ? "bg-[#EDEDFB] text-primary border-l-4 border-primary pl-2"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="hidden lg:block">{label}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_LABELS: Record<NavKey, string> = {
    dashboard: t("dashboardNav"),
    fleet: t("fleetManagement"),
    trips: t("tripManagement"),
    earnings: t("earnings"),
    profile: t("profile"),
  };

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <VendorHeader isLoggedIn userName="Rajesh Roy" />
      <OfflineIndicator />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex w-16 lg:w-60 shrink-0 flex-col border-r border-border bg-white">
          <nav className="flex flex-col gap-1 p-3 pt-4">
            {NAV_HREFS.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={NAV_LABELS[item.key]}
                icon={item.icon}
                isActive={isActive(item.href)}
              />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 pb-24 md:pb-6">{children}</div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white flex">
        {NAV_HREFS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors duration-200 cursor-pointer",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} />
              {NAV_LABELS[item.key]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
