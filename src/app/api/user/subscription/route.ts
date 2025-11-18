import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to continue.", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired session.", "INVALID_TOKEN"), {
        status: 401,
      });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: payload.id,
        status: "ACTIVE",
        endAt: {
          gte: new Date(),
        },
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            currency: true,
            durationDays: true,
            maxActiveListings: true,
            quotaListings: true,
            quotaPhotosPerListing: true,
            quotaVideosPerListing: true,
            quotaBumps: true,
            quotaFeaturedDays: true,
            maxCategories: true,
            isSticky: true,
            isFeatured: true,
          },
        },
      },
      orderBy: {
        endAt: "desc",
      },
    });

    return NextResponse.json(ok(subscription));
  } catch (error) {
    console.error("GET /api/user/subscription error:", error);
    return NextResponse.json(
      fail("Failed to load subscription. Please try again later.", "SUBSCRIPTION_ERROR"),
      { status: 500 }
    );
  }
}

