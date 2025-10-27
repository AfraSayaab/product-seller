import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { CategoryService } from "@/server/services/category.service";
import { CategoryListQuerySchema, CategoryCreateSchema } from "@/server/validators/category.schemas";
import { assertAdmin, getAuthPayload } from "@/server/admin-only";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parse = CategoryListQuerySchema.safeParse(Object.fromEntries(url.searchParams));

  if (!parse.success) {
    const flat = parse.error.flatten();
    const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
    const message = firstField || flat.formErrors?.[0] || "Invalid query parameters";

    return NextResponse.json(fail(message), { status: 400 });
  }


  const data = await CategoryService.list({
    q: parse.data.q,
    parentId: parse.data.parentId,
    isActive: parse.data.isActive,
    createdById: parse.data.createdById,
    page: parse.data.page,
    pageSize: parse.data.pageSize,
    withCounts: parse.data.withCounts === "true",
  });

  return NextResponse.json(ok(data));
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
