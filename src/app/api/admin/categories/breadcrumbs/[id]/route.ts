import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json(fail("Invalid id"), { status: 400 });

  try {
    const crumbs = await CategoryService.breadcrumbs(id);
    return NextResponse.json(ok(crumbs));
  } catch (e: any) {
    return NextResponse.json(fail(e.message ?? "Failed to fetch breadcrumbs"), { status: 400 });
  }
}
