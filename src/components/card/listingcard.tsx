"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { PublicListingDTO } from "@/lib/listing-types";

function money(price: string, currency: string) {
  // Keep simple; if you want locale formatting later, do it here.
  return `£ ${price}`;
}

export function ListingCard({ item, cardtype }: { item: PublicListingDTO; cardtype?: string }) {
  const [liked, setLiked] = React.useState(false);

  const href = `/listings/${item.slug || item.id}`;

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

          {(cardtype) && (
            <span className="absolute right-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-black/5">
              {cardtype}
            </span>
          )}

          <div className="absolute bottom-3 right-3">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLiked((v) => !v);
              }}
              className="h-10 w-10 rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 hover:bg-white"
              aria-label="Add to favourite"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
            </Button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {item.category?.name ?? "Uncategorized"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
