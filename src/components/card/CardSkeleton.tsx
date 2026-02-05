"use client";

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="relative aspect-4/3 w-full bg-muted/40 animate-pulse" />
      <div className="p-5">
        <div className="h-5 w-3/4 rounded bg-muted/40 animate-pulse" />
        <div className="mt-3 h-4 w-1/2 rounded bg-muted/30 animate-pulse" />
      </div>
    </div>
  );
}
