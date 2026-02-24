"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { fetchPublicListings } from "@/lib/listing-client";
import type { PublicListingDTO } from "@/lib/listing-types";
import { SlidersHorizontal, Search, X } from "lucide-react";

/* ================= TYPES ================= */
type SortOption = "newest" | "price_asc" | "price_desc";

interface FavouriteItem {
  id: number;
}

interface Props {
  categorySlug?: string;
  title?: string;
  defaultSort?: SortOption;
}

export default function ListingsGridPaginated({
  categorySlug,
  title,
  defaultSort = "newest",
}: Props) {
  const PAGE_SIZE = 30;

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
  ];

  /* ================= STATE ================= */
  const [items, setItems] = React.useState<(PublicListingDTO & { favorited?: boolean })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null]);

  const currentCursor = cursorStack[cursorStack.length - 1] ?? null;

  const [sortBy, setSortBy] = React.useState<SortOption>(defaultSort);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState<[number, number] | null>(null);

  /* ================= FETCH ================= */
  const loadPage = React.useCallback(
    async (cursor: string | null) => {
      try {
        setLoading(true);
        setError(null);

        // Only include price filters if values are entered
       const priceFilter: any = {};
if (priceRange?.[0] != null && priceRange[0] > 0)
  priceFilter.minPrice = priceRange[0];
if (priceRange?.[1] != null && priceRange[1] > 0)
  priceFilter.maxPrice = priceRange[1];
        const res = await fetchPublicListings({
          sort: sortBy,
          limit: PAGE_SIZE,
          cursor,
          ...(categorySlug ? { categorySlug: [categorySlug] } : {}),
          ...(searchQuery ? { search: searchQuery } : {}),
          ...priceFilter,
        });

        // Fetch favourites
        const favRes = await fetch("/api/favourites");
        const favData = await favRes.json();
        const favIds: number[] = favData?.data?.items?.map((f: FavouriteItem) => f.id) ?? [];

        const listings = res.data.map((item) => ({
          ...item,
          favorited: favIds.includes(item.id),
        }));

        setItems(listings);
        setNextCursor(res.meta?.nextCursor ?? null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load listings");
        setItems([]);
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, sortBy, searchQuery, priceRange]
  );

  React.useEffect(() => {
    setCursorStack([null]);
  }, [categorySlug, sortBy, searchQuery, priceRange]);

  React.useEffect(() => {
    loadPage(currentCursor);
  }, [currentCursor, loadPage]);

  /* ================= PAGINATION ================= */
  const canPrev = cursorStack.length > 1 && !loading;
  const canNext = !!nextCursor && !loading;

  const onNext = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  };

  const onPrev = () => {
    if (cursorStack.length <= 1) return;
    setCursorStack((prev) => prev.slice(0, -1));
  };

  const handleToggleFavourite = (listingId: number, isFav: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, favorited: isFav } : item))
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

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            onClick={() => setFilterOpen(!filterOpen)}
            className="rounded-xl flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          {filterOpen && (
            <div className="w-1/3">
              <div className="border rounded-2xl p-5 shadow-sm bg-muted/30 sticky top-6 space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setFilterOpen(false)}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full rounded-xl border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Price Range</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      placeholder="Minimum Price"
                      value={priceRange?.[0] ?? ""}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value) || 0, priceRange?.[1] ?? 0])
                      }
                      className="rounded-xl border px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Maximum Price"
                      value={priceRange?.[1] ?? ""}
                      onChange={(e) =>
                        setPriceRange([priceRange?.[0] ?? 0, Number(e.target.value) || 0])
                      }
                      className="rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>

                  <Button
                    size="sm"
                    className="mt-3 w-full rounded-xl"
                    onClick={() => loadPage(null)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className={`${filterOpen ? "w-2/3" : "w-full"}`}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => <ListingCardSkeleton key={i} />)
                : items.map((item) => (
                    <ListingCard
                      key={item.id}
                      item={item}
                      onFavouriteChange={(isFav: boolean) => handleToggleFavourite(item.id, isFav)}
                    />
                  ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" onClick={onPrev} disabled={!canPrev} className="rounded-xl">
                Previous
              </Button>
              <Button onClick={onNext} disabled={!canNext} className="rounded-xl">
                Next
              </Button>
            </div>

            {!loading && !error && items.length === 0 && (
              <div className="mt-10 text-center text-sm text-muted-foreground">
                No listings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}