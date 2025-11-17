"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { DashboardUser, UserListingMetrics } from "@/types/listings";
import UserDashboardHero from "@/components/dashboard/user/UserDashboardHero";
import UserStatCards from "@/components/dashboard/user/UserStatCards";
import UserPerformanceChart from "@/components/dashboard/user/UserPerformanceChart";
import UserTopFavorites from "@/components/dashboard/user/UserTopFavorites";
import UserRecentActivity from "@/components/dashboard/user/UserRecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Sparkles } from "lucide-react";

export default function UserDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<DashboardUser | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<UserListingMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = React.useState(true);
  const [metricsError, setMetricsError] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const currentUserId = currentUser?.id ?? null;

  const fetchProfile = React.useCallback(async () => {
    setProfileLoading(true);
    try {
      const user = await api<DashboardUser>("/api/auth/me");
      setCurrentUser(user);
    } catch (error) {
      toast.error("Could not load your profile. Please refresh.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchMetrics = React.useCallback(async () => {
    if (!currentUserId) return;
    setMetricsLoading(true);
    setMetricsError(false);
    try {
      const res = await api<UserListingMetrics>(`/api/listings/metrics?userId=${currentUserId}`);
      setMetrics(res);
    } catch (error: any) {
      setMetricsError(true);
      toast.error(error.message || "Failed to load dashboard insights");
    } finally {
      setMetricsLoading(false);
    }
  }, [currentUserId]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  React.useEffect(() => {
    if (currentUserId) {
      fetchMetrics();
    }
  }, [currentUserId, refreshKey, fetchMetrics]);

  const displayName = React.useMemo(() => {
    if (!currentUser) return "there";
    if (currentUser.firstName) return currentUser.firstName.split(" ")[0];
    if (currentUser.username) return currentUser.username;
    return "there";
  }, [currentUser]);

  const handleRefresh = React.useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const handleCreateListing = React.useCallback(() => {
    router.push("/user/listings?create=1");
  }, [router]);

  const handleManageListings = React.useCallback(() => {
    router.push("/user/listings");
  }, [router]);

  const heroDisabled = profileLoading || metricsLoading;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <UserDashboardHero
        displayName={displayName}
        totals={metrics?.totals}
        onRefresh={handleRefresh}
        onCreateListing={handleCreateListing}
        refreshDisabled={heroDisabled}
      />

      <UserStatCards totals={metrics?.totals} loading={metricsLoading} error={metricsError} />

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <UserPerformanceChart data={metrics?.monthlyTrend} loading={metricsLoading} error={metricsError} />
        <UserTopFavorites items={metrics?.topFavorites} loading={metricsLoading} error={metricsError} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserRecentActivity
            items={metrics?.recentListings}
            loading={metricsLoading}
            error={metricsError}
          />
        </div>
        <QuickActionsCard
          onCreateListing={handleCreateListing}
          onManageListings={handleManageListings}
          disabled={heroDisabled}
        />
      </div>
    </div>
  );
}

function QuickActionsCard({
  onCreateListing,
  onManageListings,
  disabled,
}: {
  onCreateListing: () => void;
  onManageListings: () => void;
  disabled: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={onCreateListing} disabled={disabled} className="justify-start gap-2">
          <Sparkles className="h-4 w-4" />
          Create new listing
        </Button>
        <Button
          variant="secondary"
          onClick={onManageListings}
          disabled={disabled}
          className="justify-start gap-2"
        >
          <Package className="h-4 w-4" />
          Manage my listings
        </Button>
      </CardContent>
    </Card>
  );
}