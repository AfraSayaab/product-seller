// app/(protected)/dashboard/admin/page.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecentTable from "@/components/admin/users/RecentTable";
import StatsGrid from "@/components/admin/Stats/StatsGrid";


export default function AdminDashboardPage() {
    return (
        <>
            <StatsGrid />

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecentTable />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button className="w-full sm:w-auto" variant="default">New Product</Button>
                        <Button className="w-full sm:w-auto" variant="secondary">Invite User</Button>
                        <Button className="w-full sm:w-auto" variant="outline">Export CSV</Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}