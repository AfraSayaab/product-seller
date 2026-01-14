"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type SpotlightItem = {
  id: string;
  title: string;
  category: string;
  priceLabel: string;
  image: string;
  featured?: boolean;
  href?: string;
};

// ✅ Put your data directly here (make ids unique)
const items: SpotlightItem[] = [
  {
    id: "1",
    title: "Suffuse Custom Made Outfit",
    category: "Women",
    priceLabel: "£1200",
    image: "/hero-image2.webp",
    featured: true,
    href: "/listings/1",
  },
  {
    id: "2",
    title: "Pakistani Bridal Dress For Sale",
    category: "Women",
    priceLabel: "£1550",
    image: "/hero-image3.webp",
    featured: true,
    href: "/listings/1",
  },
  {
    id: "3",
    title: "Luxury Clutches",
    category: "Accessories",
    priceLabel: "£120",
    image: "/hero-image4.webp",
    href: "/listings/1",
  },
  {
    id: "4",
    title: "Shahrara Style Mendhi Outfit",
    category: "Women",
    priceLabel: "£400",
    image: "/hero-image2.webp",
    href: "/listings/1",
  },
  {
    id: "5",
    title: "Embroidered 3PC Suit",
    category: "Women",
    priceLabel: "£260",
    image: "/hero-image3.webp",
    featured: true,
    href: "/listings/1",
  },
  {
    id: "6",
    title: "Formal Handbag",
    category: "Accessories",
    priceLabel: "£90",
    image: "/hero-image4.webp",
    href: "/listings/1",
  },
  {
    id: "7",
    title: "Bridal Maxi Dress",
    category: "Women",
    priceLabel: "£1800",
    image: "/hero-image2.webp",
    featured: true,
    href: "/listings/1",
  },
  {
    id: "8",
    title: "Luxury Shawl",
    category: "Accessories",
    priceLabel: "£150",
    image: "/hero-image3.webp",
    href: "/listings/1",
  },
  {
    id: "9",
    title: "Mendhi Outfit Set",
    category: "Women",
    priceLabel: "£520",
    image: "/hero-image4.webp",
    href: "/listings/1",
  },
];

export default function SearchMoreOutfit() {
  // ✅ Settings inside the component (no props)
  const initialCount = 8;
  const step = 4;
  const viewAllHref = "/listings"; // set "" or null if you don't want this button

  const [liked, setLiked] = React.useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = React.useState(initialCount);

  const visibleItems = items.slice(0, visibleCount);
  const canLoadMore = visibleCount < items.length;

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
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => {
            const isLiked = !!liked[item.id];
            const href = item.href ?? "/listings/1";

            return (
              <Link key={item.id} href={href} className="block">
                <Card className="group overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-md">
                  {/* IMAGE AREA */}
                  <div className="relative aspect-4/3 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />

                    {/* top-left: price */}
                    <Badge className="absolute left-3 top-3 rounded-md bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                      {item.priceLabel}
                    </Badge>

                    {/* top-right: featured */}
                    {item.featured && (
                      <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-black/5">
                        FEATURED
                      </span>
                    )}

                    {/* bottom-right: favourite */}
                    <div className="absolute bottom-3 right-3">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLiked((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }));
                        }}
                        className="h-10 w-10 rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 hover:bg-white"
                        aria-label="Add to favourite"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isLiked
                              ? "fill-rose-500 text-rose-500"
                              : "text-rose-500"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* WHITE AREA (TEXT BELOW IMAGE) */}
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.category}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {canLoadMore && (
            <Button
              onClick={() =>
                setVisibleCount((c) => Math.min(c + step, items.length))
              }
              className="rounded-xl"
            >
              Load more
            </Button>
          )}

          {viewAllHref && (
            <Button variant="outline" asChild className="rounded-xl">
              <Link href={viewAllHref}>View all</Link>
            </Button>
          )}

          {!canLoadMore && items.length > initialCount && (
            <p className="text-sm text-muted-foreground">
              You’ve reached the end.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
