//src\app\api\admin\categories\tree\route.ts
import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rootId = url.searchParams.get("rootId");
  const depth = url.searchParams.get("depth");
  const maxDepth = depth ? Math.max(1, Math.min(10, Number(depth))) : 5;

  try {
    const tree = await CategoryService.tree(rootId ? Number(rootId) : undefined, maxDepth);
    return NextResponse.json(ok(tree));
  } catch (e: any) {
    return NextResponse.json(fail(e.message ?? "Failed to build tree"), { status: 400 });
  }
}
