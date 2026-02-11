"use client";

import * as React from "react";
import { ListingCardSkeleton } from "@/components/card/CardSkeleton";
import { ListingCard } from "@/components/card/listingcard";
import { usePublicListings } from "@/hooks/usePublicListings";

function pickRandom<T>(arr: T[], n: number) {
  if (arr.length <= n) return arr;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

type Props = {
  excludeId?: number;
  categorySlug?: string;
};

export default function RelatedItems({ excludeId, categorySlug }: Props) {
  // 1️⃣ Fetch listings
  const {
    data: listings,
    loading: listingsLoading,
    error,
  } = usePublicListings({
    limit: 20,
    sort: "newest",
    categorySlug: categorySlug ? [categorySlug] : undefined,
  });

  // 2️⃣ Fetch favourites
  const [favIds, setFavIds] = React.useState<number[]>([]);
  const [loadingFavs, setLoadingFavs] = React.useState(true);

  React.useEffect(() => {
    async function loadFavs() {
      try {
        const res = await fetch("/api/favourites");
        const json = await res.json();
        const ids = json?.data?.items?.map((i: any) => i.id) ?? [];
        setFavIds(ids);
      } catch (e) {
        console.error("Failed to load favourites", e);
      } finally {
        setLoadingFavs(false);
      }
    }
    loadFavs();
  }, []);

  // 3️⃣ Merge favourite info into listings
  const merged = React.useMemo(() => {
    return (listings ?? []).map((item) => ({
      ...item,
      favorited: favIds.includes(item.id),
    }));
  }, [listings, favIds]);

  // 4️⃣ Pick related items
  const related = React.useMemo(() => {
    const filtered = excludeId
      ? merged.filter((i) => i.id !== excludeId)
      : merged;
    return pickRandom(filtered, 3);
  }, [merged, excludeId]);

  // 5️⃣ Local state for instant UI updates
  const [items, setItems] = React.useState<typeof related>([]);

  React.useEffect(() => {
    setItems(related);
  }, [related]);

  // 6️⃣ Sync favourite toggle
  const handleFavouriteChange = (id: number, isFav: boolean) => {
    setItems((prev) =>
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

    // Keep favIds in sync too
    setFavIds((prev) =>
      isFav ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  if (listingsLoading || loadingFavs) {
    return (
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-semibold">Related Items</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-semibold">Related Items</h2>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <ListingCard
            key={item.id}
            item={item}
            onFavouriteChange={(isFav) =>
              handleFavouriteChange(item.id, isFav)
            }
          />
        ))}
      </div>
    </section>
  );
}
