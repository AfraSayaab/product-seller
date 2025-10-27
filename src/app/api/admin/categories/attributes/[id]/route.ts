import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";
import { assertAdmin } from "@/server/admin-only";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json(fail("Invalid id"), { status: 400 });

  const { attributeSchema } = await req.json();
  try {
    const updated = await CategoryService.update(id, { attributeSchema });
    return NextResponse.json(ok(updated));
  } catch (e: any) {
    return NextResponse.json(fail(e.message ?? "Failed to update attributes"), { status: 400 });
  }
}
