import * as React from "react";
import { Eye, Heart, Package, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { UserListingMetrics } from "@/types/listings";
import { formatNumber } from "./utils";

type Props = {
  totals?: UserListingMetrics["totals"];
  loading: boolean;
  error: boolean;
};

const skeletons = Array.from({ length: 4 });

export default function UserStatCards({ totals, loading, error }: Props) {
  const statCards = React.useMemo(() => {
    if (!totals) return [];
    return [
      {
        label: "Active Listings",
        value: formatNumber(totals.active),
        helper: `${formatNumber(totals.totalListings)} total`,
        icon: <Package className="h-5 w-5" />,
      },
      {
        label: "Total Views",
        value: formatNumber(totals.totalViews),
        helper: `${formatNumber(totals.avgViewsPerListing)} avg / listing`,
        icon: <Eye className="h-5 w-5" />,
      },
      {
        label: "Favorites",
        value: formatNumber(totals.totalFavorites),
        helper: `${formatNumber(totals.active)} active collecting favorites`,
        icon: <Heart className="h-5 w-5" />,
      },
      {
        label: "Engagement Rate",
        value: `${totals.engagementRate}%`,
        helper: `${formatNumber(totals.draft + totals.pending)} draft/pending`,
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ];
  }, [totals]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.length
        ? statCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-semibold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.helper}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">{card.icon}</div>
              </CardContent>
            </Card>
          ))
        : skeletons.map((_, idx) => (
            <Card key={`stat-skeleton-${idx}`} className="border-dashed">
              <CardContent className="p-4">
                {error && idx === 0 ? (
                  <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
                    Insights unavailable
                  </div>
                ) : (
                  <div
                    className={`h-16 rounded-md bg-muted ${
                      loading ? "animate-pulse" : "opacity-60"
                    }`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
    </div>
  );
}

