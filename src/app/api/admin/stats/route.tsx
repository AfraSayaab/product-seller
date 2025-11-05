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

        // Fetch all stats in parallel for better performance
        const [
            totalUser,
            totalCategory,
            totalListings,
            activeListings,
            pendingListings,
            totalPlans,
            activeSubscriptions,
            totalOrders,
            revenueResult,
        ] = await Promise.all([
            // Total users
            prisma.user.count(),
            
            // Total categories
            prisma.category.count({
                where: { isActive: true },
            }),
            
            // Total listings (not deleted)
            prisma.listing.count({
                where: { deletedAt: null },
            }),
            
            // Active listings (ACTIVE status and not deleted)
            prisma.listing.count({
                where: {
                    status: "ACTIVE",
                    deletedAt: null,
                },
            }),
            
            // Pending listings (PENDING status and not deleted)
            prisma.listing.count({
                where: {
                    status: "PENDING",
                    deletedAt: null,
                },
            }),
            
            // Total plans
            prisma.plan.count({
                where: { isActive: true },
            }),
            
            // Active subscriptions
            prisma.subscription.count({
                where: {
                    status: "ACTIVE",
                    endAt: {
                        gte: new Date(),
                    },
                },
            }),
            
            // Total orders
            prisma.order.count(),
            
            // Total revenue from paid orders
            prisma.order.aggregate({
                where: {
                    status: "PAID",
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        // Calculate revenue (convert Decimal to number)
        const revenue = revenueResult._sum.amount 
            ? Number(revenueResult._sum.amount) 
            : 0;

        // Additional stats for future use
        const stats = {
            totalUser,
            totalProducts: activeListings, // Active listings (products)
            totalCategory,
            revenue,
            // Additional stats that might be useful
            totalListings,
            pendingListings,
            totalPlans,
            activeSubscriptions,
            totalOrders,
        };

        return NextResponse.json(ok(stats));
    } catch (error: any) {
        console.error("GET /api/admin/stats error:", error);
        return NextResponse.json(
            fail(error?.message || "Failed to fetch stats"),
            { status: 500 }
        );
    }
}