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

  // ✅ separate API call for THIS component
  const { data, loading, error } = usePublicListings({
    sort: "newest",
    limit,
  });

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

        {/* Grid - always 8 cards (or 8 skeletons while loading) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))
            : (data ?? []).slice(0, limit).map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
        </div>

        {/* Footer - View all button */}
        <div className="mt-8 flex items-center justify-center">
          <Button variant="outline" asChild className="rounded-xl">
            <Link href={viewAllHref}>View all</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
