import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { prisma } from "@/lib/db";

function parseId(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid listing ID");
  }
  return id;
}

/**
 * POST /api/views/[listingId]
 * Track a view for a listing (increment view count)
 * Public endpoint - no authentication required
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId: listingIdStr } = await ctx.params;
    const listingId = parseId(listingIdStr);

    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!listing) {
      return NextResponse.json(fail("Listing not found"), { status: 404 });
    }

    if (listing.deletedAt) {
      return NextResponse.json(fail("Listing has been deleted"), { status: 404 });
    }

    // Only increment views for active listings
    if (listing.status !== "ACTIVE") {
      return NextResponse.json(ok({ viewed: false, message: "Listing is not active" }), { status: 200 });
    }

    // Increment view count
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewsCount: true,
      },
    });

    return NextResponse.json(ok({ viewed: true, viewsCount: updated.viewsCount }), { status: 200 });
  } catch (e: any) {
    console.error("POST /api/views/[listingId] error:", e);
    if (e.message?.includes("Invalid listing ID")) {
      return NextResponse.json(fail(e.message), { status: 400 });
    }
    return NextResponse.json(fail(e?.message || "Failed to track view"), { status: 500 });
  }
}

/**
 * GET /api/views/[listingId]
 * Get view count for a specific listing
 * Public endpoint - no authentication required
 */
export async function GET(_: NextRequest, ctx: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId: listingIdStr } = await ctx.params;
    const listingId = parseId(listingIdStr);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        viewsCount: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!listing) {
      return NextResponse.json(fail("Listing not found"), { status: 404 });
    }

    return NextResponse.json(
      ok({
        listingId: listing.id,
        viewsCount: listing.viewsCount,
        status: listing.status,
      })
    );
  } catch (e: any) {
    console.error("GET /api/views/[listingId] error:", e);
    if (e.message?.includes("Invalid listing ID")) {
      return NextResponse.json(fail(e.message), { status: 400 });
    }
    return NextResponse.json(fail(e?.message || "Failed to get view count"), { status: 500 });
  }
}

