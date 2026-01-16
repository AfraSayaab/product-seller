// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";
import { CategoryUpdateSchema } from "@/server/validators/category.schemas";
import { assertAdmin } from "@/server/admin-only";

// --- helpers --------------------------------------------------

function parseId(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }
  return id;
}

function zodFirstMessage(flat: { formErrors: string[]; fieldErrors: Record<string, string[] | undefined> }) {
  const firstFieldMsg = Object.values(flat.fieldErrors)?.find(a => a && a.length)?.[0];
  return firstFieldMsg || flat.formErrors?.[0] || "Invalid input";
}

// --- GET /api/admin/categories/[id] ---------------------------

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;      // <-- await the params
    const id = parseId(idStr);

    const cat = await CategoryService.getById(id);
    if (!cat) return NextResponse.json(fail("Not found"), { status: 404 });

    return NextResponse.json(ok(cat));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Bad request"), { status: 400 });
  }
}

// --- PATCH /api/admin/categories/[id] -------------------------

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  try {
    const { id: idStr } = await ctx.params;      // <-- await the params
    const id = parseId(idStr);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
    }

    const parse = CategoryUpdateSchema.safeParse(body);
    if (!parse.success) {
      const flat = parse.error.flatten();
      return NextResponse.json(fail(zodFirstMessage(flat)), { status: 400 });
    }

    const updated = await CategoryService.update(id, parse.data);
    return NextResponse.json(ok(updated));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Update failed"), { status: 400 });
  }
}

// --- DELETE /api/admin/categories/[id]?force=1 ----------------

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  try {
    const { id: idStr } = await ctx.params;      // <-- await the params
    const id = parseId(idStr);

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";

    await CategoryService.remove(id, force);
    return NextResponse.json(ok({ deleted: true }));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Delete failed"), { status: 400 });
  }
}
