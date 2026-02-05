"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { fetchPublicListings } from "@/lib/listing-client";
import type { PublicListingDTO } from "@/lib/listing-types";

export default function ListingsGridPaginated() {
  const PAGE_SIZE = 30;

  const [items, setItems] = React.useState<PublicListingDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null]);
  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;

  const loadPage = React.useCallback(async (cursor: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchPublicListings({
        sort: "newest",
        limit: PAGE_SIZE,
        cursor,
      });

      setItems(res.data);
      setNextCursor(res.meta.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load listings");
      setItems([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPage(currentCursor);
  }, [currentCursor, loadPage]);

  const canPrev = cursorStack.length > 1 && !loading;
  const canNext = !!nextCursor && !loading;

  function onNext() {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }

  function onPrev() {
    if (cursorStack.length <= 1) return;
    setCursorStack((prev) => prev.slice(0, -1));
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
            All Listings
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse all items. Showing {PAGE_SIZE} per page.
          </p>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))
            : items.map((item) => <ListingCard key={item.id} item={item} />)}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onPrev}
            disabled={!canPrev}
          >
            Previous
          </Button>

          <Button className="rounded-xl" onClick={onNext} disabled={!canNext}>
            Next
          </Button>
        </div>

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            No listings found.
          </div>
        )}
      </div>
    </section>
  );
}
