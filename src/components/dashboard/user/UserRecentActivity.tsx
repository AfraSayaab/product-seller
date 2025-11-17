import * as React from "react";
import { Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserListingMetrics } from "@/types/listings";
import { formatDate, formatMoney, formatNumber, getStatusVariant, humanizeStatus } from "./utils";

type Props = {
  items?: UserListingMetrics["recentListings"];
  loading: boolean;
  error: boolean;
};

export default function UserRecentActivity({ items = [], loading, error }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recent activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest changes across your listings</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`recent-skeleton-${idx}`} className="h-16 animate-pulse rounded-md bg-muted/60" />
          ))
        ) : error ? (
          <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
            Unable to load recent activity.
          </div>
        ) : items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={getStatusVariant(item.status)}>{humanizeStatus(item.status)}</Badge>
                  <span>Updated {formatDate(item.updatedAt)}</span>
                  <span>•</span>
                  <span>{formatNumber(item.viewsCount)} views</span>
                  <span>•</span>
                  <span>{formatNumber(item.favoritesCount)} saves</span>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground md:text-right">
                {formatMoney(item.price, item.currency)}
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-20 flex-col items-center justify-center text-sm text-muted-foreground">
            <Activity className="mb-2 h-5 w-5" />
            <p>No recent updates yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

