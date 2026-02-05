import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicListings } from "./query";

export const runtime = "nodejs";

const schema = z.object({
  q: z.string().optional(),

  categoryId: z.union([z.string(), z.array(z.string())]).optional(),
  categorySlug: z.union([z.string(), z.array(z.string())]).optional(),

  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),

  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  currency: z.string().optional(),
  condition: z.string().optional(),

  featured: z.string().optional(),
  spotlight: z.string().optional(),

  status: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular", "featured"]).optional(),

  limit: z.string().optional(),
  cursor: z.string().optional(),
});

function toArray(v?: string | string[]) {
  if (!v) return undefined;
  return Array.isArray(v) ? v : [v];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = schema.parse(Object.fromEntries(searchParams.entries()));

    const categoryId = toArray(parsed.categoryId)?.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    const categorySlug = toArray(parsed.categorySlug);

    const minPrice = parsed.minPrice ? Number(parsed.minPrice) : undefined;
    const maxPrice = parsed.maxPrice ? Number(parsed.maxPrice) : undefined;

    const featured = parsed.featured ? parsed.featured === "true" : undefined;
    const spotlight = parsed.spotlight ? parsed.spotlight === "true" : undefined;

    const limit = parsed.limit ? Number(parsed.limit) : undefined;

    const result = await getPublicListings({
      q: parsed.q,
      categoryId: categoryId?.length ? categoryId : undefined,
      categorySlug: categorySlug?.length ? categorySlug : undefined,

      country: parsed.country,
      state: parsed.state,
      city: parsed.city,
      area: parsed.area,

      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      currency: parsed.currency,
      condition: parsed.condition,

      featured,
      spotlight,

      // keep public safe
      status: parsed.status ?? "ACTIVE",
      sort: parsed.sort ?? "newest",

      limit,
      cursor: parsed.cursor,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=120",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Bad Request", message: err?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}
