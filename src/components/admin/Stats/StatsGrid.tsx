// components/admin/StatsGrid.tsx
"use client";
import * as React from "react";
import { toast } from "sonner";
import Stat from "./Statcard";
import { api } from "@/lib/api";

export type AdminStats = {
  totalUser: number;
  totalProducts: number;
  totalCategory: number;
  revenue: number;
  totalListings: number;
  pendingListings: number;
  totalPlans: number;
  activeSubscriptions: number;
  totalOrders: number;
};

export default function StatsGrid() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<AdminStats>("/api/admin/stats");
      setStats(res);
    } catch (e: any) {
      toast.error(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const n = (v?: number) => (typeof v === "number" ? v.toLocaleString() : "—");
  const formatCurrency = (v?: number) => {
    if (typeof v !== "number") return "—";
    return `PKR ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat title="Total Users" value={n(stats?.totalUser)} loading={loading} />
      <Stat title="Active Products" value={n(stats?.totalProducts)} loading={loading} />
      <Stat title="Categories" value={n(stats?.totalCategory)} loading={loading} />
      <Stat title="Total Revenue" value={formatCurrency(stats?.revenue)} loading={loading} />
      <Stat title="Total Listings" value={n(stats?.totalListings)} loading={loading} />
      <Stat title="Pending Listings" value={n(stats?.pendingListings)} loading={loading} />
      <Stat title="Active Plans" value={n(stats?.totalPlans)} loading={loading} />
      <Stat title="Active Subscriptions" value={n(stats?.activeSubscriptions)} loading={loading} />
      {/* <Stat title="Total Orders" value={n(stats?.totalOrders)} loading={loading} /> */}
    </div>
  );
}

