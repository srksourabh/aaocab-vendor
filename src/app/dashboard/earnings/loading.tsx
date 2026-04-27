export default function EarningsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="h-7 w-24 animate-pulse rounded-lg bg-muted-foreground/20" />
        <div className="h-9 w-36 animate-pulse rounded-lg bg-muted-foreground/15" />
      </div>

      {/* Period selector */}
      <div className="flex gap-1 rounded-xl bg-white border border-border p-1 w-fit">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-lg bg-muted-foreground/10" />
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-border p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/15 mb-3" />
            <div className="h-7 w-20 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        ))}
      </div>

      {/* Table/cards skeleton */}
      <div className="rounded-xl bg-white border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-28 animate-pulse rounded bg-muted-foreground/20" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="h-4 w-20 animate-pulse rounded bg-muted-foreground/10" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/10" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted-foreground/15" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
