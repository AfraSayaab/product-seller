"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { usePublicListings } from "@/hooks/usePublicListings";

export default function SearchMoreOutfit() {
  const viewAllHref = "/listings";
  const limit = 8;

  // Fetch newest listings
  const { data, loading, error } = usePublicListings({
    sort: "newest",
    limit,
  });

  // Local state for listings with favourited info
  const [listings, setListings] = React.useState<any[]>([]);

  // Fetch user favourites on mount and mark items
  React.useEffect(() => {
    async function loadFavourites() {
      try {
        const res = await fetch("/api/favourites");
        const favData = await res.json();

        if (favData.success && data) {
          const favIds = new Set(favData.data.items.map((f: any) => f.id));
          const updated = data.map((item: any) => ({
            ...item,
            favorited: favIds.has(item.id),
          }));
          setListings(updated);
        } else {
          setListings(data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
        setListings(data ?? []);
      }
    }

    if (data) {
      loadFavourites();
    }
  }, [data]);

  // Callback when favourite toggled
  const handleFavouriteChange = (id: number, isFav: boolean) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              favorited: isFav,
              favoritesCount: isFav
                ? (item.favoritesCount ?? 0) + 1
                : Math.max((item.favoritesCount ?? 1) - 1, 0),
            }
          : item
      )
    );
  };

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
            SEARCH MORE OUTFITS
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore some of the best.
          </p>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: limit }).map((_, i) => <ListingCardSkeleton key={i} />)
            : listings.slice(0, limit).map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  onFavouriteChange={(isFav) => handleFavouriteChange(item.id, isFav)}
                />
              ))}
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
