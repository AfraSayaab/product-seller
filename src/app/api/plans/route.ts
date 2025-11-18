import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { PlanService } from "@/server/services/plan.service";
import { z } from "zod";

const PublicPlanQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams);
    const parse = PublicPlanQuerySchema.safeParse(raw);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid query parameters";
      return NextResponse.json(fail(message), { status: 400 });
    }

    // Only return active plans for public endpoint
    const data = await PlanService.list({
      q: "",
      isActive: true,
      page: parse.data.page,
      pageSize: parse.data.pageSize,
      orderBy: [{ price: "asc" }],
    });

    return NextResponse.json(ok({
      ...data,
    }));
  } catch (err: any) {
    console.error("GET /api/plans error:", err);
    return NextResponse.json(fail("Failed to list plans", "LIST_ERROR"), { status: 500 });
  }
}

