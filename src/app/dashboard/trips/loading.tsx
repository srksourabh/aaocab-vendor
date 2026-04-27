export default function TripsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="h-7 w-36 animate-pulse rounded-lg bg-muted-foreground/20" />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-border p-1 w-full sm:w-fit overflow-x-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-muted-foreground/10" />
        ))}
      </div>

      {/* Trip cards */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0 flex flex-col gap-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/10" />
                <div className="h-5 w-64 animate-pulse rounded bg-muted-foreground/20" />
                <div className="h-3 w-36 animate-pulse rounded bg-muted-foreground/10" />
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted-foreground/15" />
                <div className="h-5 w-16 animate-pulse rounded bg-muted-foreground/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
