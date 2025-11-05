import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { ListingService } from "@/server/services/listing.service";
import { ListingListQuerySchema, ListingCreateSchema } from "@/server/validators/listing.schemas";
import type { Prisma } from "@prisma/client";

type Dir = "asc" | "desc";

// Allowed sort fields
const ALLOWED: Record<string, true> = {
  id: true,
  title: true,
  slug: true,
  price: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewsCount: true,
  favoritesCount: true,
  status: true,
};

export function parseSort(
  sort: string | undefined,
  fallback: Prisma.ListingOrderByWithRelationInput[] = [{ createdAt: "desc" }]
): Prisma.ListingOrderByWithRelationInput[] {
  if (!sort) return fallback;

  const parts = sort.split(",").map((s) => s.trim()).filter(Boolean);
  const out: Prisma.ListingOrderByWithRelationInput[] = [];

  for (const p of parts) {
    const [rawField, rawDir] = p.split(":").map((x) => x?.trim());
    const field = rawField as keyof Prisma.ListingOrderByWithRelationInput;
    const dir = (rawDir?.toLowerCase() === "asc" ? "asc" : rawDir?.toLowerCase() === "desc" ? "desc" : null) as Dir | null;

    if (!rawField || !ALLOWED[rawField]) continue;
    out.push({ [field]: (dir ?? "asc") } as Prisma.ListingOrderByWithRelationInput);
  }

  return out.length ? out : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams);
    const parse = ListingListQuerySchema.safeParse(raw);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid query parameters";
      return NextResponse.json(fail(message), { status: 400 });
    }

    const q = parse.data.q?.trim() || "";
    const sort = parse.data.sort || "createdAt:desc";
    const orderBy = parseSort(sort);

    const data = await ListingService.list({
      q,
      userId: parse.data.userId,
      categoryId: parse.data.categoryId,
      status: parse.data.status,
      condition: parse.data.condition,
      currency: parse.data.currency,
      minPrice: parse.data.minPrice,
      maxPrice: parse.data.maxPrice,
      negotiable: parse.data.negotiable,
      isPhoneVisible: parse.data.isPhoneVisible,
      locationId: parse.data.locationId,
      page: parse.data.page,
      pageSize: parse.data.pageSize,
      orderBy,
    });

    return NextResponse.json(ok({
      ...data,
      q,
      sort,
    }));
  } catch (err: any) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json(fail("Failed to list listings", "LIST_ERROR"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = ListingCreateSchema.safeParse(body);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid input";
      return NextResponse.json(fail(message), { status: 400 });
    }

    const created = await ListingService.create(parse.data);
    return NextResponse.json(ok(created), { status: 201 });
  } catch (e: any) {
    console.error("POST /api/listings error:", e);
    return NextResponse.json(fail(e.message ?? "Create failed"), { status: 400 });
  }
}

