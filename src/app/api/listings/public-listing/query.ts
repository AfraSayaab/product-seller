import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type GetPublicListingsInput = {
  q?: string;
  categoryId?: number[];
  categorySlug?: string[];

  country?: string;
  state?: string;
  city?: string;
  area?: string;

  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  condition?: string;

  featured?: boolean;
  spotlight?: boolean;

  status?: string; // default ACTIVE for public API
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "featured";

  limit?: number;
  cursor?: string; // encoded listing id
};

function clampLimit(n?: number) {
  const val = Number.isFinite(n) ? Number(n) : 12;
  return Math.max(1, Math.min(val, 48));
}

export async function getPublicListings(input: GetPublicListingsInput) {
  const limit = clampLimit(input.limit);

  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    status: (input.status as any) ?? "ACTIVE",
  };

  // search
  if (input.q?.trim()) {
    const q = input.q.trim();
    // Uses @@fulltext([title, description]) from your schema
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  // category
  if (input.categoryId?.length) where.categoryId = { in: input.categoryId };
  if (input.categorySlug?.length) where.category = { slug: { in: input.categorySlug } };

  // price
  if (typeof input.minPrice === "number" || typeof input.maxPrice === "number") {
    where.price = {};
    if (typeof input.minPrice === "number") (where.price as any).gte = input.minPrice;
    if (typeof input.maxPrice === "number") (where.price as any).lte = input.maxPrice;
  }

  if (input.currency) where.currency = input.currency as any;
  if (input.condition) where.condition = input.condition as any;

  // flags
  if (typeof input.featured === "boolean") where.isFeatured = input.featured;
  if (typeof input.spotlight === "boolean") where.isSpotlight = input.spotlight;

  // location filters (joins)
  if (input.country || input.state || input.city || input.area) {
    where.location = {
      ...(input.country ? { country: input.country } : {}),
      ...(input.state ? { state: input.state } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(input.area ? { area: input.area } : {}),
    };
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput[] = (() => {
    switch (input.sort) {
      case "price_asc":
        return [{ price: "asc" }, { id: "desc" }];
      case "price_desc":
        return [{ price: "desc" }, { id: "desc" }];
      case "popular":
        return [{ viewsCount: "desc" }, { id: "desc" }];
      case "featured":
        // Featured first, then newest
        return [{ isFeatured: "desc" }, { featuredUntil: "desc" }, { id: "desc" }];
      case "newest":
      default:
        return [{ publishedAt: "desc" }, { id: "desc" }];
    }
  })();

  // cursor pagination (by id)
  const cursorId = input.cursor ? Number(input.cursor) : null;

  const rows = await prisma.listing.findMany({
    where,
    take: limit + 1,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
    orderBy,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      currency: true,
      isFeatured: true,
      isSpotlight: true,
      featuredUntil: true,
      bumpedAt: true,
      createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
      location: { select: { country: true, state: true, city: true, area: true } },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  const nextCursor = hasMore ? String(page[page.length - 1]?.id ?? "") : null;

  const data = page.map((r:any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    price: r.price.toString(),
    currency: r.currency,
    isFeatured: r.isFeatured,
    isSpotlight: r.isSpotlight,
    featuredUntil: r.featuredUntil ? r.featuredUntil.toISOString() : null,
    bumpedAt: r.bumpedAt ? r.bumpedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    category: r.category ?? null,
    location: r.location ?? null,
    primaryImageUrl: r.images?.[0]?.url ?? null,
  }));

  return {
    data,
    meta: {
      limit,
      nextCursor,
      totalReturned: data.length,
    },
  };
}
