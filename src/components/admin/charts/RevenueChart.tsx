"use client";

import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface RevenueChartProps {
    data: Array<{ date: string; value: number }>;
    loading?: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Revenue Over Time
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

    const formatCurrency = (value: number) => {
        return `PKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Over Time
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#000" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#000" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "#6b7280" }}
                            tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "8px",
                            }}
                            labelStyle={{ color: "#000", fontWeight: "bold" }}
                            formatter={(value: any) => formatCurrency(value)}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#000"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

