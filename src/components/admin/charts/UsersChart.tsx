"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface UsersChartProps {
    data: Array<{ date: string; value: number }>;
    loading?: boolean;
}

export default function UsersChart({ data, loading }: UsersChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Users Over Time
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
                    <Users className="h-5 w-5" />
                    Users Over Time
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
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
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#000"
                            strokeWidth={2}
                            dot={{ fill: "#000", r: 4 }}
                            activeDot={{ r: 6 }}
                            name="New Users"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

