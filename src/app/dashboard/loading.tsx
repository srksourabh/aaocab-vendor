export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl bg-white border border-border p-5 sm:p-6">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-muted-foreground/20 mb-2" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/15" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-border p-6 flex items-center gap-4">
            <div className="size-12 animate-pulse rounded-xl bg-muted-foreground/15 shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/15" />
              <div className="h-7 w-12 animate-pulse rounded bg-muted-foreground/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Trips + Earnings skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="h-5 w-28 animate-pulse rounded bg-muted-foreground/20" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3.5 border-b border-border last:border-0">
              <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/10 mb-2" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted-foreground/15" />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white border border-border p-5">
          <div className="h-5 w-36 animate-pulse rounded bg-muted-foreground/20 mb-4" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-muted-foreground/10 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between py-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/10" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
