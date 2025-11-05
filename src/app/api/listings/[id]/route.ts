import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { ListingService } from "@/server/services/listing.service";
import { ListingUpdateSchema } from "@/server/validators/listing.schemas";

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

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = parseId(idStr);

    const listing = await ListingService.getById(id);
    if (!listing) {
      return NextResponse.json(fail("Not found"), { status: 404 });
    }

    return NextResponse.json(ok(listing));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Bad request"), { status: 400 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = parseId(idStr);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
    }

    const parse = ListingUpdateSchema.safeParse(body);
    if (!parse.success) {
      const flat = parse.error.flatten();
      return NextResponse.json(fail(zodFirstMessage(flat)), { status: 400 });
    }

    const updated = await ListingService.update(id, parse.data);
    return NextResponse.json(ok(updated));
  } catch (e: any) {
    console.error("PATCH /api/listings/[id] error:", e);
    return NextResponse.json(fail(e?.message || "Update failed"), { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = parseId(idStr);

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";

    await ListingService.remove(id, force);
    return NextResponse.json(ok({ deleted: true }));
  } catch (e: any) {
    console.error("DELETE /api/listings/[id] error:", e);
    return NextResponse.json(fail(e?.message || "Delete failed"), { status: 400 });
  }
}

