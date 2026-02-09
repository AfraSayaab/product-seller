import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
const parseId = (s: string) => {
  const n = Number(s);
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid userId");
  return n;
};

function jsonSafe(value: any): any {
  if (value === null || value === undefined) return value;
  if (value?.constructor?.name === "Decimal") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = jsonSafe(value[k]);
    return out;
  }
  return value;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await ctx.params;
    const uid = parseId(userId);

    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 12), 1), 48);
    const skip = (page - 1) * limit;

    const where = {
      userId: uid,
      deletedAt: null,
      status: "ACTIVE" as const,
    };

    const [total, rows] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          currency: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
          location: { select: { area: true, city: true, state: true, country: true } },
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      }),
    ]);

    const data = rows.map((x) => ({
      id: x.id,
      slug: x.slug,
      title: x.title,
      price: x.price.toString(),  
      currency: x.currency,
      createdAt: x.createdAt,
      category: x.category,
      location: x.location,
      primaryImageUrl: x.images?.[0]?.url ?? null,
    }));

    const hasMore = page * limit < total;

    return NextResponse.json(
      jsonSafe({
        success: true,
        data,
        meta: { total, page, limit, hasMore },
      })
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Bad request" },
      { status: 400 }
    );
  }
}
