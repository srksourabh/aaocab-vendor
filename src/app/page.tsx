import Link from "next/link";
import { ArrowRight, Banknote, CalendarCheck, Wallet } from "lucide-react";
import VendorHeader from "@/components/VendorHeader";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Zero Investment",
    description: "No joining fees, no deposits. Start earning from day one.",
  },
  {
    icon: CalendarCheck,
    title: "Regular Bookings",
    description: "Consistent trip flow from corporate and leisure travellers.",
  },
  {
    icon: Banknote,
    title: "Timely Payments",
    description: "Guaranteed 7-day payment cycles. No delays, no hassle.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <VendorHeader />

      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-white border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
            <div className="inline-block rounded-full bg-[#EDEDFB] px-4 py-1.5 mb-4">
              <span className="text-sm font-semibold text-primary">
                Vendor Partner Program
              </span>
            </div>

            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-5xl leading-tight">
              Join India&apos;s Fastest-Growing
              <br />
              <span style={{ color: "#4F4ED6" }}>Car Rental Network</span>
            </h1>

            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Register your fleet with AaoCab and start earning today. Trusted
              by hundreds of vendors across India.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/register">
                <Button className="h-14 w-full sm:w-auto rounded-[40px] bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer">
                  Register Now
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Already a partner?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer"
              >
                Login here
              </Link>
            </p>
          </div>
        </section>

        {/* Benefits section */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <h2 className="font-heading text-xl font-semibold text-foreground text-center mb-8">
            Why partner with AaoCab?
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl bg-white border border-border p-6 flex flex-col gap-3"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#EDEDFB] text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Link href="/register">
              <Button className="h-12 rounded-[40px] bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer">
                Get Started — It&apos;s Free
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
