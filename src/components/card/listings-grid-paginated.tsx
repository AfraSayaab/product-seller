"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { fetchPublicListings } from "@/lib/listing-client";
import type { PublicListingDTO } from "@/lib/listing-types";

/* ================= TYPES ================= */

export type SortOption = "newest" | "price_asc" | "price_desc";

interface FavouriteItem {
  id: number;
}

interface Props {
  categorySlug?: string;
  title?: string;

  /* Controlled from parent */
  sortBy?: SortOption;
  searchQuery?: string;
  priceRange?: [number, number] | null;

  pageSize?: number;
   refreshKey?: number;
}

/* ================= COMPONENT ================= */

export default function ListingsGridPaginated({
  categorySlug,
  title,
  sortBy = "newest",
  searchQuery,
  priceRange,
  pageSize = 30,
   refreshKey,
}: Props) {
  /* ================= STATE ================= */

  const [items, setItems] = React.useState<
    (PublicListingDTO & { favorited?: boolean })[]
  >([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([
    null,
  ]);

  const currentCursor =
    cursorStack[cursorStack.length - 1] ?? null;

  /* ================= FETCH ================= */

  const loadPage = React.useCallback(
    async (cursor: string | null) => {
      try {
        setLoading(true);
        setError(null);

        const priceFilter: any = {};

        if (priceRange?.[0] && priceRange[0] > 0)
          priceFilter.minPrice = priceRange[0];

        if (priceRange?.[1] && priceRange[1] > 0)
          priceFilter.maxPrice = priceRange[1];

        const res = await fetchPublicListings({
          sort: sortBy,
          limit: pageSize,
          cursor,
          ...(categorySlug
            ? { categorySlug: [categorySlug] }
            : {}),
          ...(searchQuery ? { q: searchQuery } : {}),
          ...priceFilter,
        });

        /* Fetch favourites */
        const favRes = await fetch("/api/favourites");
        const favData = await favRes.json();

        const favIds: number[] =
          favData?.data?.items?.map(
            (f: FavouriteItem) => f.id
          ) ?? [];

        const listings = res.data.map((item) => ({
          ...item,
          favorited: favIds.includes(item.id),
        }));

        setItems(listings);
        setNextCursor(res.meta?.nextCursor ?? null);
      } catch (e: unknown) {
        setError(
          e instanceof Error
            ? e.message
            : "Failed to load listings"
        );
        setItems([]);
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, sortBy, searchQuery, priceRange, pageSize]
  );

  /* Reset pagination when filters change */
  React.useEffect(() => {
    setCursorStack([null]);
  }, [categorySlug, sortBy, searchQuery, priceRange, refreshKey]);

  React.useEffect(() => {
    loadPage(currentCursor);
  }, [currentCursor, loadPage]);

  /* ================= PAGINATION ================= */

  const canPrev =
    cursorStack.length > 1 && !loading;

  const canNext =
    !!nextCursor && !loading;

  const onNext = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [
      ...prev,
      nextCursor,
    ]);
  };

  const onPrev = () => {
    if (cursorStack.length <= 1) return;
    setCursorStack((prev) =>
      prev.slice(0, -1)
    );
  };

  const handleToggleFavourite = (
    listingId: number,
    isFav: boolean
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === listingId
          ? { ...item, favorited: isFav }
          : item
      )
    );
  };

  /* ================= UI ================= */

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
            {title ?? "All Listings"}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: pageSize }).map(
                (_, i) => (
                  <ListingCardSkeleton key={i} />
                )
              )
            : items.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  onFavouriteChange={(isFav: boolean) =>
                    handleToggleFavourite(
                      item.id,
                      isFav
                    )
                  }
                />
              ))}
        </div>

        {/* Empty State */}
        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="mt-10 text-center text-sm text-muted-foreground">
              No listings found.
            </div>
          )}

        {/* Error */}
        {error && (
          <div className="mt-6 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={!canPrev}
            className="rounded-xl"
          >
            Previous
          </Button>

          <Button
            onClick={onNext}
            disabled={!canNext}
            className="rounded-xl"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}