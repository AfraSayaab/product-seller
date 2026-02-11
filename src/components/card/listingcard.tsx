"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { PublicListingDTO } from "@/lib/listing-types";

interface ListingCardProps {
  item: PublicListingDTO & { favorited?: boolean };
  cardtype?: string;
  onFavouriteChange?: (isFav: boolean) => void; // callback for parent
}

export function ListingCard({ item, cardtype, onFavouriteChange }: ListingCardProps) {
const [liked, setLiked] = React.useState<boolean>(!!item.favorited);

// ✅ keep heart in sync with parent updates
React.useEffect(() => {
  setLiked(!!item.favorited);
}, [item.favorited]);

  const [loading, setLoading] = React.useState(false);

  const href = `/listings/${item.id}`;

  const money = (price: number | string, currency: string) =>
    `£ ${currency} ${Number(price).toLocaleString()}`;

  const toggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      let res;
      if (!liked) {
        // Add to favourites
        res = await fetch("/api/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: Number(item.id) }),
        });
      } else {
        // Remove from favourites
        res = await fetch(`/api/favourites/${item.id}`, {
          method: "DELETE",
        });
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data.message ?? data);
        return;
      }

      // Update state
      setLiked(!liked);
      onFavouriteChange?.(!liked); // notify parent grid
    } catch (error) {
      console.error("toggleFavourite error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={href} className="block">
      <Card className="group overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-md">
        <div className="relative aspect-4/3 w-full overflow-hidden">
          <Image
            src={item.primaryImageUrl ?? "/hero-image2.webp"}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />

          <Badge className="absolute left-3 top-3 rounded-md bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
            {money(item.price, item.currency)}
          </Badge>

          {cardtype && (
            <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-black/5">
              {cardtype}
            </span>
          )}

          <div className="absolute bottom-3 right-3">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={toggleFavourite}
              className="h-10 w-10 rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 hover:bg-white"
              aria-label={liked ? "Remove from favourite" : "Add to favourite"}
              disabled={loading}
            >
              <Heart
                className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : "text-rose-500"}`}
              />
            </Button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {item.category?.name ?? "Uncategorized"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
