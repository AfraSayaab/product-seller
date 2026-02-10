//src\app\api\admin\categories\validate-slug\route.ts
import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim();
  const excludeId = url.searchParams.get("excludeId");

  if (!slug) return NextResponse.json(fail("Missing slug"), { status: 400 });

  const available = await CategoryService.isSlugAvailable(slug, excludeId ? Number(excludeId) : undefined);
  return NextResponse.json(ok({ available }));
}
