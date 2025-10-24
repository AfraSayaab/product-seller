
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
  planPurchased: number;
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

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat title="Total Users" value={n(stats?.totalUser)} loading={loading} />
      <Stat title="Active Products" value={n(stats?.totalProducts)} loading={loading} />
      <Stat title="Categories" value={n(stats?.totalCategory)} loading={loading} />
      <Stat title="Plans Purchased" value={n(stats?.planPurchased)} loading={loading} />
    </div>
  );
}

