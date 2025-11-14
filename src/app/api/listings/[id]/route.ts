import { NextRequest, NextResponse } from "next/server";
import { ok, fail } from "@/lib/responses";
import { ListingService } from "@/server/services/listing.service";
import { ListingUpdateSchema } from "@/server/validators/listing.schemas";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ZodError } from "zod";

function parseId(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }
  return id;
}

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
    // Get current user from token
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to update listings.", "UNAUTHORIZED"), { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid or expired token. Please login again.", "INVALID_TOKEN"), { status: 401 });
    }

    const { id: idStr } = await ctx.params;
    const id = parseId(idStr);

    // Check if listing exists and user has permission
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(fail("Listing not found"), { status: 404 });
    }

    // Check if user owns the listing or is admin
    if (payload.role !== "ADMIN" && existing.userId !== payload.id) {
      return NextResponse.json(fail("Forbidden. You can only update your own listings.", "FORBIDDEN"), { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
    }

    const parse = ListingUpdateSchema.safeParse(body);
    if (!parse.success) {
      const errorMessage = formatZodError(parse.error);
      return NextResponse.json(fail(errorMessage, "VALIDATION_ERROR"), { status: 400 });
    }

    const updated = await ListingService.update(id, parse.data, payload.id, payload.role);
    return NextResponse.json(ok(updated));
  } catch (e: any) {
    console.error("PATCH /api/listings/[id] error:", e);
    // Return proper error message with appropriate status code
    const statusCode = e.message?.includes("subscription") || e.message?.includes("plan") || e.message?.includes("quota") ? 403 : 400;
    return NextResponse.json(fail(e?.message || "Update failed"), { status: statusCode });
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

