import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { ListingService } from "@/server/services/listing.service";

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

    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get("userId");
    const resolvedUserId =
      payload.role === "ADMIN" && requestedUserId ? Number(requestedUserId) : payload.id;

    if (!resolvedUserId || Number.isNaN(resolvedUserId)) {
      return NextResponse.json(fail("Invalid user specified for metrics.", "INVALID_USER"), {
        status: 400,
      });
    }

    const metrics = await ListingService.userMetrics(resolvedUserId);

    return NextResponse.json(ok(metrics));
  } catch (error) {
    console.error("GET /api/listings/metrics error:", error);
    return NextResponse.json(
      fail("Failed to load listing insights. Please try again later.", "LISTING_METRICS_ERROR"),
      { status: 500 }
    );
  }
}


