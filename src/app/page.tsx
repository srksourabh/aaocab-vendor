"use client";

import Link from "next/link";
import { ArrowRight, Banknote, CalendarCheck, Wallet } from "lucide-react";
import VendorHeader from "@/components/VendorHeader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export default function HomePage() {
  const { t } = useLanguage();

  const BENEFITS = [
    {
      icon: Wallet,
      titleKey: "benefit1Title" as const,
      descKey: "benefit1Desc" as const,
    },
    {
      icon: CalendarCheck,
      titleKey: "benefit2Title" as const,
      descKey: "benefit2Desc" as const,
    },
    {
      icon: Banknote,
      titleKey: "benefit3Title" as const,
      descKey: "benefit3Desc" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <VendorHeader />

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-white border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
            <div className="inline-block rounded-full bg-[#EDEDFB] px-4 py-1.5 mb-4">
              <span className="text-sm font-semibold text-primary">
                {t("vendorPartnerProgram")}
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-5xl leading-tight">
              {t("landingHero")}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              {t("landingSubtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/register">
                <Button className="h-14 w-full sm:w-auto rounded-[40px] bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer">
                  {t("registerNow")}
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {t("alreadyPartner")}{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
              >
                {t("loginHere")}
              </Link>
            </p>
          </div>
        </section>

        {/* Benefits section */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <h2 className="font-heading text-xl font-semibold text-foreground text-center mb-8">
            {t("whyPartner")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.titleKey}
                  className="rounded-2xl bg-white border border-border p-6 flex flex-col gap-3"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#EDEDFB] text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(benefit.descKey)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Link href="/register">
              <Button className="h-12 rounded-[40px] bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer">
                {t("getStartedFree")}
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-border bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
          <span className="font-heading font-bold text-primary">AaoCab</span>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AaoCab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
