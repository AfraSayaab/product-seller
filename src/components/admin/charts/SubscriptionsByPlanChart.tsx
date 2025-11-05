"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface SubscriptionsByPlanChartProps {
    data: Array<{ name: string; value: number }>;
    loading?: boolean;
}

export default function SubscriptionsByPlanChart({ data, loading }: SubscriptionsByPlanChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscriptions by Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscriptions by Plan
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            stroke="#6b7280"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "#6b7280" }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "8px",
                            }}
                            labelStyle={{ color: "#000", fontWeight: "bold" }}
                        />
                        <Legend />
                        <Bar
                            dataKey="value"
                            fill="#000"
                            radius={[8, 8, 0, 0]}
                            name="Subscriptions"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

