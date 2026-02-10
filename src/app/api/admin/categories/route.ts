//src\app\api\admin\categories\route.ts
import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";
import { CategoryListQuerySchema, CategoryCreateSchema } from "@/server/validators/category.schemas";
import { assertAdmin, getAuthPayload } from "@/server/admin-only";
import type { Prisma } from "@prisma/client";

type Dir = "asc" | "desc";

// Only allow these fields to be sorted on.
const ALLOWED: Record<string, true> = {
  id: true,
  name: true,
  slug: true,
  parentId: true,
  isActive: true,
  createdAt: true,
};

export function parseSort(
  sort: string | undefined,
  fallback: Prisma.CategoryOrderByWithRelationInput[] = [{ createdAt: "desc" }]
): Prisma.CategoryOrderByWithRelationInput[] {
  if (!sort) return fallback;

  // support "field:asc,other:desc"
  const parts = sort.split(",").map((s) => s.trim()).filter(Boolean);
  const out: Prisma.CategoryOrderByWithRelationInput[] = [];

  for (const p of parts) {
    const [rawField, rawDir] = p.split(":").map((x) => x?.trim());
    const field = rawField as keyof Prisma.CategoryOrderByWithRelationInput;
    const dir = (rawDir?.toLowerCase() === "asc" ? "asc" : rawDir?.toLowerCase() === "desc" ? "desc" : null) as Dir | null;

    if (!rawField || !ALLOWED[rawField]) continue; // silently ignore unknown like "role"
    out.push({ [field]: (dir ?? "asc") } as Prisma.CategoryOrderByWithRelationInput);
  }

  return out.length ? out : fallback;
}


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams);
    const parse = CategoryListQuerySchema.safeParse(raw);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid query parameters";
      return NextResponse.json(fail(message), { status: 400 });
    }

    const q = parse.data.q?.trim() || "";
    const sort = parse.data.sort || "createdAt:desc";
    const orderBy = parseSort(sort);

    const withCountsFlag = (parse.data.withCounts || "false") === "true";

    const data = await CategoryService.list({
      q,
      parentId: parse.data.parentId,
      isActive: typeof parse.data.isActive === "boolean" ? parse.data.isActive : undefined,
      createdById: parse.data.createdById,
      page: parse.data.page,
      pageSize: parse.data.pageSize,
      withCounts: withCountsFlag,
      orderBy,
    });

    // Echo useful query context (helps debugging)
    return NextResponse.json(ok({
      ...data,
      q,
      sort,
    }));
  } catch (err: any) {
    console.error("GET /api/admin/categories error:", err);
    return NextResponse.json(fail("Failed to list categories", "LIST_ERROR"), { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  const payload = getAuthPayload(req);
  if (!payload) return NextResponse.json(fail("Unauthorized"), { status: 401 });

  const body = await req.json();
  const parse = await CategoryCreateSchema.safeParse(body);
  console.log("parse object :", parse)
  if (!parse.success) {
    // Extract the first useful message (field or form)
    const flat = parse.error.flatten();
    const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
    const message = firstField || flat.formErrors?.[0] || "Invalid input";

    return NextResponse.json(fail(message), { status: 400 });
  }


  try {
    const created = await CategoryService.create({
      ...parse.data,
      createdById: Number(payload.id), // support either field
    });
    return NextResponse.json(ok(created), { status: 201 });
  } catch (e: any) {
    return NextResponse.json(fail(e.message ?? "Create failed"), { status: 400 });
  }
}
