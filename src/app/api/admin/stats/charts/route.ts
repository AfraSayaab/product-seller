import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = getTokenFromReq(req);
        const payload = token && verifyJwt(token);
        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json(fail("Forbidden"), { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "30", 10);

        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);

        // Users over time (last 30 days by default)
        const usersOverTime = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                createdAt: true,
            },
        });

        // Listings over time
        const listingsOverTime = await prisma.listing.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                },
                deletedAt: null,
            },
            select: {
                createdAt: true,
            },
        });

        // Listings by status
        const listingsByStatus = await prisma.listing.groupBy({
            by: ["status"],
            where: {
                deletedAt: null,
            },
            _count: {
                id: true,
            },
        });

        // Orders over time (revenue)
        const ordersOverTime = await prisma.order.findMany({
            where: {
                status: "PAID",
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                createdAt: true,
                amount: true,
            },
        });

        // Subscriptions by plan
        const subscriptionsByPlan = await prisma.subscription.groupBy({
            by: ["planId"],
            where: {
                status: "ACTIVE",
                endAt: {
                    gte: now,
                },
            },
            _count: {
                id: true,
            },
        });

        // Get plan names for subscriptions
        const planIds = subscriptionsByPlan.map((s) => s.planId);
        const plans = await prisma.plan.findMany({
            where: {
                id: {
                    in: planIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const planMap = new Map(plans.map((p) => [p.id, p.name]));

        // Format data for charts
        const formatDate = (date: Date) => {
            return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        };

        // Group by day for line charts
        const groupByDay = (data: Array<{ createdAt: Date; amount?: any }>, isRevenue = false) => {
            const grouped = new Map<string, number>();
            data.forEach((item) => {
                const dateKey = new Date(item.createdAt).toISOString().split("T")[0];
                const value = isRevenue ? Number(item.amount) || 0 : 1;
                grouped.set(dateKey, (grouped.get(dateKey) || 0) + value);
            });

            // Generate all days in range
            const daysArray: Array<{ date: string; value: number }> = [];
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateKey = date.toISOString().split("T")[0];
                daysArray.push({
                    date: formatDate(date),
                    value: grouped.get(dateKey) || 0,
                });
            }

            return daysArray;
        };

        return NextResponse.json(
            ok({
                usersOverTime: groupByDay(usersOverTime),
                listingsOverTime: groupByDay(listingsOverTime),
                listingsByStatus: listingsByStatus.map((item) => ({
                    name: item.status,
                    value: item._count.id,
                })),
                revenueOverTime: groupByDay(ordersOverTime, true),
                subscriptionsByPlan: subscriptionsByPlan.map((item) => ({
                    name: planMap.get(item.planId) || `Plan ${item.planId}`,
                    value: item._count.id,
                })),
            })
        );
    } catch (error: any) {
        console.error("GET /api/admin/stats/charts error:", error);
        return NextResponse.json(fail(error?.message || "Failed to fetch chart data"), { status: 500 });
    }
}

