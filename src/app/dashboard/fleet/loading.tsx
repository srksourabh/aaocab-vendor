export default function FleetLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-muted-foreground/20" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-primary/20" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-border p-1 w-fit">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted-foreground/10" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted-foreground/10" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-border p-5 flex flex-col gap-3">
            <div className="flex justify-between">
              <div>
                <div className="h-5 w-32 animate-pulse rounded bg-muted-foreground/20 mb-1" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted-foreground/15" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/15" />
            </div>
            <div className="h-4 w-40 animate-pulse rounded bg-muted-foreground/10" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-muted-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
