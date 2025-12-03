import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";
import { assertAdmin } from "@/server/admin-only";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const guard = assertAdmin(req);
  if (guard) return guard;

  // params is now a Promise
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(fail("Invalid id"), { status: 400 });
  }

  const { attributeSchema } = await req.json();

  try {
    const updated = await CategoryService.update(id, { attributeSchema });
    return NextResponse.json(ok(updated));
  } catch (e: any) {
    return NextResponse.json(
      fail(e?.message ?? "Failed to update attributes"),
      { status: 400 }
    );
  }
}
