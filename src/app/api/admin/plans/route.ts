import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { PlanService } from "@/server/services/plan.service";
import { PlanListQuerySchema, PlanCreateSchema } from "@/server/validators/plan.schemas";
import type { Prisma } from "@prisma/client";

type Dir = "asc" | "desc";

// Allowed sort fields
const ALLOWED: Record<string, true> = {
  id: true,
  name: true,
  slug: true,
  price: true,
  durationDays: true,
  createdAt: true,
  updatedAt: true,
};

export function parseSort(
  sort: string | undefined,
  fallback: Prisma.PlanOrderByWithRelationInput[] = [{ createdAt: "desc" }]
): Prisma.PlanOrderByWithRelationInput[] {
  if (!sort) return fallback;

  const parts = sort.split(",").map((s) => s.trim()).filter(Boolean);
  const out: Prisma.PlanOrderByWithRelationInput[] = [];

  for (const p of parts) {
    const [rawField, rawDir] = p.split(":").map((x) => x?.trim());
    const field = rawField as keyof Prisma.PlanOrderByWithRelationInput;
    const dir = (rawDir?.toLowerCase() === "asc" ? "asc" : rawDir?.toLowerCase() === "desc" ? "desc" : null) as Dir | null;

    if (!rawField || !ALLOWED[rawField]) continue;
    out.push({ [field]: (dir ?? "asc") } as Prisma.PlanOrderByWithRelationInput);
  }

  return out.length ? out : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams);
    const parse = PlanListQuerySchema.safeParse(raw);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid query parameters";
      return NextResponse.json(fail(message), { status: 400 });
    }

    const q = parse.data.q?.trim() || "";
    const sort = parse.data.sort || "createdAt:desc";
    const orderBy = parseSort(sort);

    const data = await PlanService.list({
      q,
      isActive: parse.data.isActive,
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
    console.error("GET /api/admin/plans error:", err);
    return NextResponse.json(fail("Failed to list plans", "LIST_ERROR"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = PlanCreateSchema.safeParse(body);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid input";
      return NextResponse.json(fail(message), { status: 400 });
    }

    const created = await PlanService.create(parse.data);
    return NextResponse.json(ok(created), { status: 201 });
  } catch (e: any) {
    console.error("POST /api/admin/plans error:", e);
    return NextResponse.json(fail(e.message ?? "Create failed"), { status: 400 });
  }
}

