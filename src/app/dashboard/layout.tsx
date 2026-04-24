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
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Fleet", href: "/dashboard/fleet", icon: Car },
  { label: "Trips", href: "/dashboard/trips", icon: ClipboardList },
  { label: "Earnings", href: "/dashboard/earnings", icon: IndianRupee },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

function NavItem({
  item,
  isActive,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer",
        isActive
          ? "bg-[#EDEDFB] text-primary border-l-4 border-primary pl-2"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="hidden lg:block">{item.label}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <VendorHeader isLoggedIn userName="Rajesh Roy" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex w-16 lg:w-60 shrink-0 flex-col border-r border-border bg-white">
          <nav className="flex flex-col gap-1 p-3 pt-4">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
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
        {NAV_ITEMS.map((item) => {
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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
