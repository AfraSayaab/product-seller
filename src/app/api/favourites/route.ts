import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const AddFavoriteSchema = z.object({
  listingId: z.number().int().positive("Listing ID must be a positive number"),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to view favourites.", "UNAUTHORIZED"), { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired token. Please login again.", "INVALID_TOKEN"), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

    const skip = (page - 1) * pageSize;

    // Get favourites with listing details
    const [favourites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: payload.id },
        include: {
          listing: {
            include: {
              images: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              location: {
                select: {
                  id: true,
                  country: true,
                  state: true,
                  city: true,
                  area: true,
                },
              },
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.favorite.count({
        where: { userId: payload.id },
      }),
    ]);

    const items = favourites.map((fav) => ({
      id: fav.listing.id,
      title: fav.listing.title,
      slug: fav.listing.slug,
      price: Number(fav.listing.price),
      currency: fav.listing.currency,
      condition: fav.listing.condition,
      status: fav.listing.status,
      viewsCount: fav.listing.viewsCount,
      favoritesCount: fav.listing.favoritesCount,
      createdAt: fav.listing.createdAt.toISOString(),
      updatedAt: fav.listing.updatedAt.toISOString(),
      favoritedAt: fav.createdAt.toISOString(),
      category: fav.listing.category,
      location: fav.listing.location,
      images: fav.listing.images.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary,
      })),
      user: fav.listing.user,
    }));

    return NextResponse.json(
      ok({
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("GET /api/favourites error:", e);
    return NextResponse.json(fail(e?.message || "Failed to fetch favourites"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to add favourites.", "UNAUTHORIZED"), { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired token. Please login again.", "INVALID_TOKEN"), { status: 401 });
    }

    const body = await req.json();
    const parse = AddFavoriteSchema.safeParse(body);

    if (!parse.success) {
      const errorMessage = parse.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json(fail(errorMessage, "VALIDATION_ERROR"), { status: 400 });
    }

    const { listingId } = parse.data;

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(fail("Listing not found"), { status: 404 });
    }

    // Check if already favourited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: payload.id,
          listingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(fail("Listing is already in your favourites"), { status: 400 });
    }

    // Add favourite and update count in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.favorite.create({
        data: {
          userId: payload.id,
          listingId,
        },
      });

      await tx.listing.update({
        where: { id: listingId },
        data: {
          favoritesCount: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json(ok({ added: true }), { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error("POST /api/favourites error:", e);
    // Handle unique constraint violation
    if (e.code === "P2002") {
      return NextResponse.json(fail("Listing is already in your favourites"), { status: 400 });
    }
    return NextResponse.json(fail(e?.message || "Failed to add favourite"), { status: 500 });
  }
}

