// app/(protected)/dashboard/admin/page.tsx
import * as React from "react";
import StatsGrid from "@/components/admin/Stats/StatsGrid";
import DashboardCharts from "@/components/admin/charts/DashboardCharts";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <StatsGrid />
            <DashboardCharts />
        </div>
    );
}