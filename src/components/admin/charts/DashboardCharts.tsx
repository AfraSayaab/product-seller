"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import UsersChart from "./UsersChart";
import ListingsChart from "./ListingsChart";
import RevenueChart from "./RevenueChart";
import ListingsStatusChart from "./ListingsStatusChart";
import SubscriptionsByPlanChart from "./SubscriptionsByPlanChart";

interface ChartData {
    usersOverTime: Array<{ date: string; value: number }>;
    listingsOverTime: Array<{ date: string; value: number }>;
    listingsByStatus: Array<{ name: string; value: number }>;
    revenueOverTime: Array<{ date: string; value: number }>;
    subscriptionsByPlan: Array<{ name: string; value: number }>;
}

export default function DashboardCharts() {
    const [loading, setLoading] = React.useState(true);
    const [chartData, setChartData] = React.useState<ChartData | null>(null);

    const fetchChartData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await api<ChartData>("/api/admin/stats/charts?days=30");
            setChartData(res);
        } catch (e: any) {
            toast.error(e.message || "Failed to load chart data");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <UsersChart data={chartData?.usersOverTime || []} loading={loading} />
            <ListingsChart data={chartData?.listingsOverTime || []} loading={loading} />
            <RevenueChart data={chartData?.revenueOverTime || []} loading={loading} />
            <ListingsStatusChart data={chartData?.listingsByStatus || []} loading={loading} />
            <div className="md:col-span-2">
                <SubscriptionsByPlanChart data={chartData?.subscriptionsByPlan || []} loading={loading} />
            </div>
        </div>
    );
}

