import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm flex flex-col items-center text-center gap-5">
        {/* Logo */}
        <span
          className="font-heading text-2xl font-bold"
          style={{ color: "#4F4ED6" }}
        >
          AaoCab
        </span>

        {/* 404 graphic */}
        <div className="flex size-16 items-center justify-center rounded-full bg-[#EDEDFB]">
          <span className="font-heading text-2xl font-bold text-primary">
            404
          </span>
        </div>

        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[40px] bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-[#3D3CB8] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <Home className="size-4" />
          Return to Dashboard Home
        </Link>
      </div>
    </div>
  );
}
