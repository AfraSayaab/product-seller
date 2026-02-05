"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { fetchPublicListings } from "@/lib/listing-client";
import type { PublicListingDTO } from "@/lib/listing-types";
export default function SpotlightWardrobeGrid() {
  const PAGE_SIZE = 12;

  const [items, setItems] = React.useState<PublicListingDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Cursor pagination
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  // Keep history so we can go Previous properly
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null]);

  const loadPage = React.useCallback(async (pageCursor: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchPublicListings({
        spotlight: true,
        sort: "featured",
        limit: PAGE_SIZE,
        cursor: pageCursor,
      });

      setItems(res.data);
      setNextCursor(res.meta.nextCursor);
      setCursor(pageCursor);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load spotlight listings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // first page
    loadPage(null);
  }, [loadPage]);

  const canPrev = cursorStack.length > 1 && !loading;
  const canNext = !!nextCursor && !loading;

  function onNext() {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    loadPage(nextCursor);
  }

  function onPrev() {
    if (cursorStack.length <= 1) return;
    setCursorStack((prev) => prev.slice(0, -1));
    const prevCursor = cursorStack[cursorStack.length - 2] ?? null;
    loadPage(prevCursor);
  }

  return (
    <section className="w-full py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-rose-500">Explore Our Highlights</p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
            Spotlight Wardrobe
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Explore all spotlight listings.</p>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <ListingCardSkeleton key={i} />)
            : items.map((item) => (
                <ListingCard key={item.id} item={item} cardtype="SPOTLIGHT" />
              ))}
        </div>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button variant="outline" className="rounded-xl" onClick={onPrev} disabled={!canPrev}>
            Previous
          </Button>

          <Button className="rounded-xl" onClick={onNext} disabled={!canNext}>
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
