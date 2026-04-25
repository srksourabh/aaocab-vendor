export default function RegisterLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stepper skeleton */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <div className="h-4 w-20 animate-pulse rounded-full bg-muted-foreground/20" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-muted-foreground/20" />
      </div>

      {/* Card skeleton */}
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted-foreground/20 mb-2" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-muted-foreground/15 mb-8" />

        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted-foreground/15" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-muted-foreground/10" />
            </div>
          ))}
        </div>

        <div className="mt-8 h-14 w-full animate-pulse rounded-[40px] bg-primary/20" />
      </div>
    </div>
  );
}
