import * as React from "react";
import { Plus, RefreshCcw } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserListingMetrics } from "@/types/listings";
import { formatNumber } from "./utils";

type Props = {
  displayName: string;
  totals?: UserListingMetrics["totals"];
  onRefresh: () => void;
  onCreateListing: () => void;
  refreshDisabled?: boolean;
};

export default function UserDashboardHero({
  displayName,
  totals,
  onRefresh,
  onCreateListing,
  refreshDisabled,
}: Props) {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Seller Dashboard</p>
            <h2 className="text-3xl font-semibold">Welcome back, {displayName}.</h2>
            <p className="text-white/80">
              {totals
                ? `${formatNumber(totals.active)} active listings • ${formatNumber(
                    totals.totalViews
                  )} lifetime views`
                : "Track your listings, favorites, and performance in one place."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              onClick={onRefresh}
              disabled={refreshDisabled}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh data
            </Button>
            <Button onClick={onCreateListing} className="bg-white text-primary hover:bg-white/90">
              <Plus className="mr-2 h-4 w-4" />
              Create listing
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

