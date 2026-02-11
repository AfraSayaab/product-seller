import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

function parseId(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid listing ID");
  }
  return id;
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ listingId: string }> }) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to remove favourites.", "UNAUTHORIZED"), { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired token. Please login again.", "INVALID_TOKEN"), { status: 401 });
    }

    const { listingId: listingIdStr } = await ctx.params;
    const listingId = parseId(listingIdStr);

    // Check if favourite exists
    const favourite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: payload.id,
          listingId,
        },
      },
    });

    if (!favourite) {
      return NextResponse.json(fail("Favourite not found"), { status: 404 });
    }

    // Remove favourite and update count in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.favorite.delete({
        where: {
          userId_listingId: {
            userId: payload.id,
            listingId,
          },
        },
      });

      // Decrement favourites count (ensure it doesn't go below 0)
      await tx.listing.update({
        where: { id: listingId },
        data: {
          favoritesCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json(ok({ removed: true }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("DELETE /api/favourites/[listingId] error:", e);
    if (e.message?.includes("Invalid listing ID")) {
      return NextResponse.json(fail(e.message), { status: 400 });
    }
    return NextResponse.json(fail(e?.message || "Failed to remove favourite"), { status: 500 });
  }
}

