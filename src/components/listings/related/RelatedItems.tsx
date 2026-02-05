"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingCardSkeleton } from "@/components/card/CardSkeleton";
import { usePublicListings } from "@/hooks/usePublicListings";

function money(price: string, currency: string) {
  return `${currency} ${price}`;
}

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
  excludeId?: number; // current listing id (optional)
  categorySlug?: string; // optional: keep related within same category
};

export default function RelatedItems({ excludeId, categorySlug }: Props) {
  // ✅ separate API call for THIS component
  const { data, loading, error } = usePublicListings({
    limit: 20, // fetch more so we can randomize properly
    sort: "newest",
    categorySlug: categorySlug ? [categorySlug] : undefined,
  });

  const related = React.useMemo(() => {
    const filtered = (data ?? []).filter((x) => (excludeId ? x.id !== excludeId : true));
    return pickRandom(filtered, 3);
  }, [data, excludeId]);

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-semibold">Related Items</h2>

      {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)
          : related.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.slug || item.id}`}
                className="group"
              >
                <Card className="overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-md">
                  {/* IMAGE AREA */}
                  <div className="relative aspect-4/3 w-full overflow-hidden">
                    <Image
                      src={item.primaryImageUrl ?? "/hero-image1.webp"}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw"
                    />

                    {/* price badge */}
                    <Badge className="absolute left-3 top-3 rounded-md bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                      {money(item.price, item.currency)}
                    </Badge>
                  </div>

                  {/* TEXT AREA */}
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">View details</p>
                  </div>
                </Card>
              </Link>
            ))}
      </div>
    </section>
  );
}
