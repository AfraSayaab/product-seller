// app/(protected)/dashboard/admin/page.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---- Stat Card Component ----
function Stat({ title, value, hint }: { title: string; value: string; hint?: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{value}</div>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
        </Card>
    );
}

// ---- Recent Users Table ----
function RecentTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="pb-2">User</th>
                                <th className="pb-2">Email</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {[
                                { u: "sarah", e: "sarah@example.com", r: "ADMIN", j: "2025-10-21" },
                                { u: "john", e: "john@example.com", r: "USER", j: "2025-10-20" },
                                { u: "maria", e: "maria@example.com", r: "USER", j: "2025-10-19" },
                            ].map((row) => (
                                <tr key={row.e}>
                                    <td className="py-2">{row.u}</td>
                                    <td className="py-2 text-muted-foreground">{row.e}</td>
                                    <td className="py-2">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                                            row.r === "ADMIN" ? "bg-foreground text-background" : "bg-muted text-foreground"
                                        )}>{row.r}</span>
                                    </td>
                                    <td className="py-2 text-muted-foreground">{row.j}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// ---- Dashboard Page Content ----
export default function UserDashboardPage() {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Stat title="Total Users" value="12,483" hint="+3.1% from last week" />
                <Stat title="Active Products" value="842" hint="-1.2% from yesterday" />
                <Stat title="Orders (24h)" value="1,203" />
                <Stat title="Revenue (24h)" value="$38,920" />
            </div>

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