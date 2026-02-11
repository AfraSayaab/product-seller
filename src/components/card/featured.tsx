"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { ListingCard } from "./listingcard";
import { ListingCardSkeleton } from "./CardSkeleton";
import { usePublicListings } from "@/hooks/usePublicListings";

export default function FeaturedWardrobeCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const { data, loading, error } = usePublicListings({
    featured: true,
    sort: "featured",
    limit: 16,
  });

  // Local state for listings, includes favorited
  const [listings, setListings] = React.useState<any[]>([]);

  // Fetch user favourites on mount
  React.useEffect(() => {
    async function loadFavourites() {
      try {
        const res = await fetch("/api/favourites");
        const favData = await res.json();
        if (favData.success && data) {
          const favIds = new Set(favData.data.items.map((f: any) => f.id));
          // Map data and mark favorited
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
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-rose-500">Explore Our Highlights</p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-pink-500 md:text-5xl">
            Featured Wardrobe
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Explore some of the best.</p>
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        </div>

        <div className="relative">
          <Carousel opts={{ align: "start", loop: true }} plugins={[autoplay.current]} className="w-full">
            <CarouselContent className="-ml-4">
              {(loading ? Array.from({ length: 8 }) : listings).map((item: any, idx) => (
                <CarouselItem
                  key={item?.id ?? idx}
                  className="pl-4 basis-[88%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  {loading ? (
                    <ListingCardSkeleton />
                  ) : (
                    <ListingCard
                      item={item}
                      cardtype="FEATURED"
                      onFavouriteChange={(isFav) => handleFavouriteChange(item.id, isFav)}
                    />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="pointer-events-none absolute -top-14 right-0 flex items-center gap-2">
              <div className="pointer-events-auto">
                <CarouselPrevious className="static h-10 w-10 rounded-lg border bg-background shadow-sm hover:bg-muted" />
              </div>
              <div className="pointer-events-auto">
                <CarouselNext className="static h-10 w-10 rounded-lg border bg-background shadow-sm hover:bg-muted" />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
