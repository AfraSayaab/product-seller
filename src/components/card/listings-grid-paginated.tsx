"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { fetchPublicListings } from "@/lib/listing-client";
import type { PublicListingDTO } from "@/lib/listing-types";

export default function ListingsGridPaginated() {
  const PAGE_SIZE = 30;

  const [items, setItems] = React.useState<(PublicListingDTO & { favorited?: boolean })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null]);
  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;

  // Fetch listings
  const loadPage = React.useCallback(async (cursor: string | null) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch listings
      const res = await fetchPublicListings({
        sort: "newest",
        limit: PAGE_SIZE,
        cursor,
      });

      let listings = res.data;

      // Fetch user favourites
      const favRes = await fetch("/api/favourites");
      const favData = await favRes.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const favIds = favData.data?.items?.map((f: any) => f.id) || [];

      // Mark which listings are already favourited
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listings = listings.map((item: any) => ({
        ...item,
        favorited: favIds.includes(item.id),
      }));

      setItems(listings);
      setNextCursor(res.meta.nextCursor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Callback to update the item's favourited state in the grid
  const handleToggleFavourite = (listingId: number, isFav: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, favorited: isFav } : item
      )
    );
  };

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
            : items.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  cardtype=""
                  // Pass callback to update grid state
                  onFavouriteChange={(isFav: boolean) =>
                    handleToggleFavourite(item.id, isFav)
                  }
                />
              ))}
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
