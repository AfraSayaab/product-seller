"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { fetchPublicListings } from "@/lib/listing-client";
import type { PublicListingDTO } from "@/lib/listing-types";

interface Props {
  categorySlug?: string;
  title?: string;
  defaultSort?: string;
}

export default function ListingsGridPaginated({
  categorySlug,
  title,
  defaultSort = "newest",
}: Props) {
  const PAGE_SIZE = 30;

  const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Most Popular", value: "popular" },
  ];

  const [items, setItems] = React.useState<(PublicListingDTO & { favorited?: boolean })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null]);
  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;
  const [sortBy, setSortBy] = React.useState(defaultSort);

  // Fetch listings
  const loadPage = React.useCallback(
    async (cursor: string | null) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchPublicListings({
          sort: sortBy,
          limit: PAGE_SIZE,
          cursor,
          ...(categorySlug ? { categorySlug: [categorySlug] } : {}),
        });

        let listings = res.data;

        // Fetch user favourites
        const favRes = await fetch("/api/favourites");
        const favData = await favRes.json();
        const favIds = favData.data?.items?.map((f: any) => f.id) || [];

        // Mark favourited items
        listings = listings.map((item: any) => ({
          ...item,
          favorited: favIds.includes(item.id),
        }));

        setItems(listings);
        setNextCursor(res.meta.nextCursor);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load listings");
        setItems([]);
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, sortBy]
  );

  // Reset pagination when category or sort changes
  React.useEffect(() => {
    setCursorStack([null]);
  }, [categorySlug, sortBy]);

  // Load listings when cursor changes
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

  // Update favourite state in grid
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
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
            {title ?? "All Listings"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse all items. Showing {PAGE_SIZE} per page.
          </p>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </div>

        {/* Modern Filter Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={sortBy === opt.value ? "default" : "outline"}
              onClick={() => setSortBy(opt.value)}
              className="rounded-xl px-4 py-2"
            >
              {opt.label}
            </Button>
          ))}
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
                  onFavouriteChange={(isFav: boolean) =>
                    handleToggleFavourite(item.id, isFav)
                  }
                />
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
