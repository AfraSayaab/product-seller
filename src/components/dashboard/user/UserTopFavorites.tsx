import * as React from "react";
import { Heart, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserListingMetrics } from "@/types/listings";
import { formatMoney, formatNumber, getStatusVariant, humanizeStatus } from "./utils";

type Props = {
  items?: UserListingMetrics["topFavorites"];
  loading: boolean;
  error: boolean;
};

export default function UserTopFavorites({ items = [], loading, error }: Props) {
  return (
    <Card className="min-h-[320px]">
      <CardHeader className="pb-2">
        <CardTitle>Top favorites</CardTitle>
        <p className="text-sm text-muted-foreground">Listings your audience saves the most</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`fav-skeleton-${idx}`} className="h-14 animate-pulse rounded-md bg-muted/60" />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Unable to load favorites.
          </div>
        ) : items.length ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div
                className="h-12 w-12 flex-shrink-0 rounded-md bg-muted bg-cover bg-center"
                style={item.primaryImage ? { backgroundImage: `url(${item.primaryImage})` } : undefined}
              >
                {!item.primaryImage && (
                  <Package className="mx-auto my-2 h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">{formatMoney(item.price, item.currency)}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatNumber(item.viewsCount)} views</span>
                  <span>•</span>
                  <span>{formatNumber(item.favoritesCount)} saves</span>
                </div>
              </div>
              <Badge variant={getStatusVariant(item.status)}>{humanizeStatus(item.status)}</Badge>
            </div>
          ))
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <Heart className="mb-2 h-8 w-8 text-muted-foreground" />
            <p>No favorites yet</p>
            <p className="text-xs">Boost visibility to collect favorites.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

