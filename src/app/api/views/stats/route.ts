import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/views/stats
 * Get view statistics for authenticated user's listings
 * Requires authentication
 */
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to view statistics.", "UNAUTHORIZED"), { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired token. Please login again.", "INVALID_TOKEN"), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // all, month, week, today

    // Calculate date range based on period
    let dateFilter: { gte?: Date } | undefined;
    const now = new Date();
    
    if (period === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { gte: startOfDay };
    } else if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (period === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    const where = {
      userId: payload.id,
      deletedAt: null,
      ...(dateFilter ? { updatedAt: dateFilter } : {}),
    };

    // Get aggregate statistics
    const [totalViews, totalListings, avgViewsPerListing, topViewedListings] = await Promise.all([
      // Total views across all user's listings
      prisma.listing.aggregate({
        where,
        _sum: {
          viewsCount: true,
        },
      }),
      // Total listings count
      prisma.listing.count({ where }),
      // Average views per listing
      prisma.listing.aggregate({
        where,
        _avg: {
          viewsCount: true,
        },
      }),
      // Top 10 most viewed listings
      prisma.listing.findMany({
        where,
        orderBy: [
          { viewsCount: "desc" },
          { updatedAt: "desc" },
        ],
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          viewsCount: true,
          favoritesCount: true,
          status: true,
          price: true,
          currency: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: {
              url: true,
              isPrimary: true,
            },
          },
        },
      }),
    ]);

    // Get views by status breakdown
    const viewsByStatus = await prisma.listing.groupBy({
      by: ["status"],
      where,
      _sum: {
        viewsCount: true,
      },
      _count: {
        _all: true,
      },
    });

    const totalViewsCount = totalViews._sum.viewsCount ?? 0;
    const avgViews = totalListings > 0 ? Math.round((totalViewsCount / totalListings) * 100) / 100 : 0;

    return NextResponse.json(
      ok({
        period,
        totals: {
          totalViews: totalViewsCount,
          totalListings,
          avgViewsPerListing: avgViews,
        },
        topViewed: topViewedListings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          viewsCount: listing.viewsCount,
          favoritesCount: listing.favoritesCount,
          status: listing.status,
          price: Number(listing.price),
          currency: listing.currency,
          primaryImage: listing.images[0]?.url || null,
        })),
        viewsByStatus: viewsByStatus.map((item) => ({
          status: item.status,
          totalViews: item._sum.viewsCount ?? 0,
          listingCount: item._count._all,
        })),
      })
    );
  } catch (e: any) {
    console.error("GET /api/views/stats error:", e);
    return NextResponse.json(fail(e?.message || "Failed to fetch view statistics"), { status: 500 });
  }
}

