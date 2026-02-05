import { NextResponse } from "next/server";
import { BLOGS } from "./data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 6);

  const start = (page - 1) * limit;
  const paginated = BLOGS.slice(start, start + limit);

  return NextResponse.json({
    data: paginated,
    total: BLOGS.length,
    totalPages: Math.ceil(BLOGS.length / limit),
    currentPage: page,
  });
}
