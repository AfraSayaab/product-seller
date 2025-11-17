import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { ListingService } from "@/server/services/listing.service";
import { ListingListQuerySchema, ListingCreateSchema } from "@/server/validators/listing.schemas";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import type { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// Helper function to format Zod errors into user-friendly messages
function formatZodError(error: ZodError): string {
  const issues = error.issues;
  
  if (issues.length === 0) {
    return "Invalid input. Please check your data and try again.";
  }

  // Get the first error (most relevant)
  const firstIssue = issues[0];
  const fieldPath = firstIssue.path.join(".");
  const fieldName = fieldPath || "field";

  // Handle specific field names for better UX
  const fieldLabels: Record<string, string> = {
    "categoryId": "category",
    "locationId": "location ID",
    "location.country": "country code",
    "location.state": "state",
    "location.city": "city",
    "location.area": "area",
    "location.lat": "latitude",
    "location.lng": "longitude",
    "userId": "user ID",
    "isPhoneVisible": "phone visibility",
  };

  const displayFieldName = fieldLabels[fieldPath] || fieldName;

  // Use custom message if available and user-friendly
  if (firstIssue.message && !firstIssue.message.includes("expected") && !firstIssue.message.includes("received")) {
    return firstIssue.message;
  }

  // Special handling for invalid_type errors
  if (firstIssue.code === "invalid_type") {
    const invalidTypeIssue = firstIssue as any;
    const expected = invalidTypeIssue.expected || "valid value";
    const received = invalidTypeIssue.received || "invalid value";
    
    if (received === "undefined") {
      return `The ${displayFieldName} field is required. Please provide a value.`;
    }
    if (expected === "number" && received === "string") {
      return `The ${displayFieldName} field must be a number. Please provide a numeric value.`;
    }
    if (expected === "string" && received === "number") {
      return `The ${displayFieldName} field must be text. Please provide a text value.`;
    }
    if (expected === "number" && received === "undefined") {
      return `The ${displayFieldName} field is required and must be a number.`;
    }
    return `The ${displayFieldName} field is invalid. Expected ${expected}, but received ${received}.`;
  }

  // Handle other error types
  const issueMessage = (firstIssue as any).message || "";
  const issueCode = firstIssue.code as string;
  
  if (issueCode === "too_small") {
    return `The ${displayFieldName} field is too small. ${issueMessage || "Please provide a larger value."}`;
  }
  if (issueCode === "too_big") {
    return `The ${displayFieldName} field is too large. ${issueMessage || "Please provide a smaller value."}`;
  }
  if (issueCode === "invalid_string") {
    return `The ${displayFieldName} field contains invalid text. ${issueMessage}`;
  }
  if (issueCode === "invalid_enum_value") {
    return `The ${displayFieldName} field has an invalid value. ${issueMessage || "Please select a valid option."}`;
  }

  // Return the message or fallback
  return issueMessage || `The ${displayFieldName} field is invalid.`;
}

type Dir = "asc" | "desc";

// Allowed sort fields
const ALLOWED: Record<string, true> = {
  id: true,
  title: true,
  slug: true,
  price: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  viewsCount: true,
  favoritesCount: true,
  status: true,
};

export function parseSort(
  sort: string | undefined,
  fallback: Prisma.ListingOrderByWithRelationInput[] = [{ createdAt: "desc" }]
): Prisma.ListingOrderByWithRelationInput[] {
  if (!sort) return fallback;

  const parts = sort.split(",").map((s) => s.trim()).filter(Boolean);
  const out: Prisma.ListingOrderByWithRelationInput[] = [];

  for (const p of parts) {
    const [rawField, rawDir] = p.split(":").map((x) => x?.trim());
    const field = rawField as keyof Prisma.ListingOrderByWithRelationInput;
    const dir = (rawDir?.toLowerCase() === "asc" ? "asc" : rawDir?.toLowerCase() === "desc" ? "desc" : null) as Dir | null;

    if (!rawField || !ALLOWED[rawField]) continue;
    out.push({ [field]: (dir ?? "asc") } as Prisma.ListingOrderByWithRelationInput);
  }

  return out.length ? out : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams);
    const parse = ListingListQuerySchema.safeParse(raw);

    if (!parse.success) {
      const flat = parse.error.flatten();
      const firstField = Object.values(flat.fieldErrors)?.[0]?.[0];
      const message = firstField || flat.formErrors?.[0] || "Invalid query parameters";
      return NextResponse.json(fail(message), { status: 400 });
    }

    const q = parse.data.q?.trim() || "";
    const sort = parse.data.sort || "createdAt:desc";
    const orderBy = parseSort(sort);

    // Parse comma-separated arrays
    const categoryIds = parse.data.categoryIds
      ? parse.data.categoryIds.split(",").map((id) => parseInt(id.trim())).filter((id) => !isNaN(id))
      : undefined;

    const conditions = parse.data.conditions
      ? parse.data.conditions.split(",").map((c) => c.trim()).filter(Boolean)
      : undefined;

    const currencies = parse.data.currencies
      ? parse.data.currencies.split(",").map((c) => c.trim()).filter(Boolean)
      : undefined;

    const data = await ListingService.list({
      q,
      userId: parse.data.userId,
      categoryId: parse.data.categoryId,
      categoryIds,
      status: parse.data.status,
      condition: parse.data.condition,
      conditions,
      currency: parse.data.currency,
      currencies,
      minPrice: parse.data.minPrice,
      maxPrice: parse.data.maxPrice,
      negotiable: parse.data.negotiable,
      isPhoneVisible: parse.data.isPhoneVisible,
      locationId: parse.data.locationId,
      country: parse.data.country,
      state: parse.data.state,
      city: parse.data.city,
      area: parse.data.area,
      lat: parse.data.lat,
      lng: parse.data.lng,
      radius: parse.data.radius,
      sortByDistance: parse.data.sortByDistance,
      page: parse.data.page,
      pageSize: parse.data.pageSize,
      orderBy,
    });

    return NextResponse.json(ok({
      ...data,
      q,
      sort,
    }));
  } catch (err: any) {
    console.error("GET /api/listings error:", err);
    return NextResponse.json(fail("Failed to list listings", "LIST_ERROR"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get current user from token
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to create listings.", "UNAUTHORIZED"), { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired token. Please login again.", "INVALID_TOKEN"), { status: 401 });
    }

    const body = await req.json();
    
    // Validate schema exists
    if (!ListingCreateSchema) {
      console.error("ListingCreateSchema is undefined");
      return NextResponse.json(fail("Schema validation error"), { status: 500 });
    }

    const parse = ListingCreateSchema.safeParse(body);

    if (!parse.success) {
      const errorMessage = formatZodError(parse.error);
      return NextResponse.json(fail(errorMessage, "VALIDATION_ERROR"), { status: 400 });
    }

    // Use userId from token to ensure user can only create listings for themselves
    // Admin can create for any user by providing userId in body
    const userId = payload.role === "ADMIN" && parse.data.userId ? parse.data.userId : payload.id;
    
    const created = await ListingService.create({
      ...parse.data,
      userId,
    });
    return NextResponse.json(ok(created), { status: 201 });
  } catch (e: any) {
    console.error("POST /api/listings error:", e);
    // Return proper error message with appropriate status code
    const statusCode = e.message?.includes("subscription") || e.message?.includes("plan") || e.message?.includes("quota") ? 403 : 400;
    return NextResponse.json(fail(e.message ?? "Failed to create listing"), { status: statusCode });
  }
}

